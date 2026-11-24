import { safeStorage } from "electron";
import type Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type LlmProvider = "openai" | "openrouter";

export const defaultModels: Record<LlmProvider, string> = {
  openai: "gpt-4o-mini",
  openrouter: "deepseek/deepseek-v4-flash"
};

interface Migration {
  version: number;
  description: string;
  up: () => void;
}

function isLlmProvider(value: string | undefined): value is LlmProvider {
  return value === "openai" || value === "openrouter";
}

function tableColumns(db: Database.Database, table: string): Set<string> {
  const rows = db.pragma(`table_info(${table})`) as { name: string }[];
  return new Set(rows.map((row) => row.name));
}

function setting(db: Database.Database, key: string): string | undefined {
  return (
    db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined
  )?.value;
}

function setDefault(db: Database.Database, key: string, value: string): void {
  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run(key, value);
}

function migrateInitialSchema(db: Database.Database): void {
  db.exec(readFileSync(join(__dirname, "schema.sql"), "utf8"));

  const contacts = tableColumns(db, "contacts");
  if (!contacts.has("observations")) {
    db.exec("ALTER TABLE contacts ADD COLUMN observations TEXT NOT NULL DEFAULT ''");
  }
  if (!contacts.has("avatar_color")) {
    db.exec("ALTER TABLE contacts ADD COLUMN avatar_color TEXT NOT NULL DEFAULT '#dcefe9'");
  }

  const legacyProfile = db
    .prepare("SELECT key, value FROM settings WHERE key LIKE 'profile.%'")
    .all() as { key: string; value: string }[];
  if (legacyProfile.length) {
    const values = Object.fromEntries(
      legacyProfile.map(({ key, value }) => [key.slice("profile.".length), value])
    );
    db.prepare(
      `INSERT OR IGNORE INTO profile
       (id, name, country, state, city, language, observations, apply_regionalisms)
       VALUES (1, @name, @country, @state, @city, @language, @observations, 1)`
    ).run({
      name: values.name ?? "Você",
      country: values.country ?? "Brasil",
      state: values.state ?? "",
      city: values.city ?? "",
      language: values.language ?? "Português",
      observations: values.observations ?? ""
    });
  }
}

function migrateLlmSettings(db: Database.Database): void {
  const legacyProvider = setting(db, "llm_provider");
  const hasLegacyOpenAiSettings = Boolean(
    setting(db, "llm.model") || setting(db, "llm.apiKey") || process.env.OPENAI_API_KEY?.trim()
  );
  const provider = isLlmProvider(legacyProvider)
    ? legacyProvider
    : hasLegacyOpenAiSettings
      ? "openai"
      : "openrouter";
  setDefault(db, "llm.provider", provider);

  const openAiModel =
    setting(db, "llm.model") ??
    (legacyProvider === "openai" ? setting(db, "llm_model") : undefined) ??
    process.env.OPENAI_MODEL ??
    defaultModels.openai;
  const openRouterModel =
    (legacyProvider === "openrouter" ? setting(db, "llm_model") : undefined) ??
    process.env.OPENROUTER_MODEL ??
    defaultModels.openrouter;
  setDefault(db, "llm.model.openai", openAiModel);
  setDefault(db, "llm.model.openrouter", openRouterModel);

  const legacyOpenAiKey = setting(db, "llm.apiKey");
  if (legacyOpenAiKey) setDefault(db, "llm.apiKey.openai", legacyOpenAiKey);

  const legacyOpenRouterKey = setting(db, "openrouter_api_key");
  if (legacyOpenRouterKey?.trim()) {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error(
        "Não foi possível migrar a chave antiga do OpenRouter: a criptografia segura do sistema não está disponível."
      );
    }
    const encryptedKey = db
      .prepare("SELECT value FROM settings WHERE key = ?")
      .get("llm.apiKey.openrouter") as { value: string } | undefined;
    if (!encryptedKey) {
      const encrypted = safeStorage.encryptString(legacyOpenRouterKey.trim()).toString("base64");
      setDefault(db, "llm.apiKey.openrouter", encrypted);
    }
    db.prepare("DELETE FROM settings WHERE key = 'openrouter_api_key'").run();
  }
}

function migrateDeepSeekModel(db: Database.Database): void {
  db.prepare("UPDATE settings SET value = ? WHERE key = 'llm.model.openrouter' AND value = ?").run(
    defaultModels.openrouter,
    "deepseek/deepseek-v4-flash:free"
  );
}

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const currentVersionRow = db
    .prepare("SELECT MAX(version) AS version FROM schema_migrations")
    .get() as { version: number | null };
  const currentVersion = currentVersionRow.version ?? 0;

  const migrations: Migration[] = [
    {
      version: 1,
      description: "Cria o schema BabelTalk e migra perfis e contatos existentes",
      up: () => migrateInitialSchema(db)
    },
    {
      version: 2,
      description: "Adiciona provedores OpenAI e OpenRouter",
      up: () => migrateLlmSettings(db)
    },
    {
      version: 3,
      description: "Atualiza o modelo DeepSeek do OpenRouter",
      up: () => migrateDeepSeekModel(db)
    }
  ];

  const applyMigration = db.transaction((migration: Migration) => {
    migration.up();
    db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(migration.version);
  });

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.info(`Aplicando migração v${migration.version}: ${migration.description}`);
      applyMigration(migration);
    }
  }
}
