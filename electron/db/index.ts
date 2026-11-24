import { app, safeStorage } from "electron";
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

export type Tone = "formal" | "coloquial" | "tosco" | "original";
export type Direction = "outgoing" | "incoming";

export interface Contact {
  id: string;
  name: string;
  country: string;
  state: string;
  city: string;
  language: string;
  observations: string;
  avatarColor: string;
  createdAt: string;
}

export interface Message {
  id: string;
  contactId: string;
  text: string;
  tone: Tone;
  direction: Direction;
  createdAt: string;
}

export interface Profile {
  name: string;
  country: string;
  state: string;
  city: string;
  language: string;
  observations: string;
  applyRegionalisms: boolean;
}

interface ContactRow {
  id: string;
  name: string;
  country: string;
  state: string;
  city: string;
  language: string;
  observations: string;
  avatar_color: string;
  created_at: string;
}

interface MessageRow {
  id: string;
  contact_id: string;
  text: string;
  tone: Tone;
  direction: Direction;
  created_at: string;
}

interface ProfileRow {
  id: number;
  name: string;
  country: string;
  state: string;
  city: string;
  language: string;
  observations: string;
  apply_regionalisms: number;
}

const colors = ["#dcefe9", "#f7e7d8", "#e7e4f5", "#f7e3e7", "#dceaf5"];
let database: Database.Database | undefined;

function db(): Database.Database {
  if (!database) throw new Error("O banco de dados ainda não foi inicializado.");
  return database;
}

function mapContact(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    state: row.state,
    city: row.city,
    language: row.language,
    observations: row.observations,
    avatarColor: row.avatar_color,
    createdAt: row.created_at
  };
}

function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    contactId: row.contact_id,
    text: row.text,
    tone: row.tone,
    direction: row.direction,
    createdAt: row.created_at
  };
}

export function initializeDatabase(): void {
  const file = join(app.getPath("userData"), "babeltalk.sqlite");
  database = new Database(file);
  database.pragma("journal_mode = WAL");
  database.exec(readFileSync(join(__dirname, "schema.sql"), "utf8"));
  migrateDatabase();
}

function migrateDatabase(): void {
  const columns = db().pragma("table_info(contacts)") as { name: string }[];
  if (!columns.some((column) => column.name === "observations")) {
    db().exec("ALTER TABLE contacts ADD COLUMN observations TEXT NOT NULL DEFAULT ''");
  }
  const legacy = db()
    .prepare("SELECT key, value FROM settings WHERE key LIKE 'profile.%'")
    .all() as { key: string; value: string }[];
  if (legacy.length) {
    const values = Object.fromEntries(legacy.map(({ key, value }) => [key.slice("profile.".length), value]));
    db().prepare(
      `INSERT OR IGNORE INTO profile (id, name, country, state, city, language, observations, apply_regionalisms)
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

export function listContacts(): Contact[] {
  const rows = db()
    .prepare(
      `SELECT c.*, (SELECT text FROM messages m WHERE m.contact_id = c.id
       ORDER BY created_at DESC LIMIT 1) AS last_message
       FROM contacts c ORDER BY COALESCE(
         (SELECT MAX(created_at) FROM messages m WHERE m.contact_id = c.id),
         c.created_at
       ) DESC`
    )
    .all() as (ContactRow & { last_message: string | null })[];
  return rows.map(mapContact);
}

export function createContact(input: Omit<Contact, "id" | "avatarColor" | "createdAt">): Contact {
  const contact: Contact = {
    ...input,
    id: randomUUID(),
    avatarColor: colors[Math.floor(Math.random() * colors.length)],
    createdAt: new Date().toISOString()
  };
  db()
    .prepare(
      `INSERT INTO contacts (id, name, country, state, city, language, observations, avatar_color, created_at)
       VALUES (@id, @name, @country, @state, @city, @language, @observations, @avatarColor, @createdAt)`
    )
    .run(contact);
  return contact;
}

export function updateContact(contact: Contact): Contact {
  const result = db()
    .prepare(
      `UPDATE contacts SET name = @name, country = @country, state = @state,
       city = @city, language = @language, observations = @observations WHERE id = @id`
    )
    .run(contact);
  if (result.changes === 0) throw new Error("Contato não encontrado.");
  const row = db().prepare("SELECT * FROM contacts WHERE id = ?").get(contact.id) as ContactRow;
  return mapContact(row);
}

export function deleteContact(id: string): void {
  const result = db().prepare("DELETE FROM contacts WHERE id = ?").run(id);
  if (result.changes === 0) throw new Error("Contato não encontrado.");
}

export function getContact(id: string): Contact {
  const row = db().prepare("SELECT * FROM contacts WHERE id = ?").get(id) as ContactRow | undefined;
  if (!row) throw new Error("Contato não encontrado.");
  return mapContact(row);
}

export function listMessages(contactId: string): Message[] {
  return (db()
    .prepare("SELECT * FROM messages WHERE contact_id = ? ORDER BY created_at ASC")
    .all(contactId) as MessageRow[]).map(mapMessage);
}

export function createMessage(
  input: Omit<Message, "id" | "createdAt">
): Message {
  const message: Message = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
  db()
    .prepare(
      `INSERT INTO messages (id, contact_id, text, tone, direction, created_at)
       VALUES (@id, @contactId, @text, @tone, @direction, @createdAt)`
    )
    .run(message);
  return message;
}

export function getProfile(): Profile {
  let row = db().prepare("SELECT * FROM profile WHERE id = 1").get() as ProfileRow | undefined;
  if (!row) {
    db().prepare("INSERT INTO profile (id) VALUES (1)").run();
    row = db().prepare("SELECT * FROM profile WHERE id = 1").get() as ProfileRow;
  }
  return {
    name: row.name,
    country: row.country,
    state: row.state,
    city: row.city,
    language: row.language,
    observations: row.observations,
    applyRegionalisms: row.apply_regionalisms === 1
  };
}

export function saveProfile(profile: Profile): Profile {
  db().prepare(
    `INSERT INTO profile (id, name, country, state, city, language, observations, apply_regionalisms)
     VALUES (1, @name, @country, @state, @city, @language, @observations, @applyRegionalisms)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, country = excluded.country,
       state = excluded.state, city = excluded.city, language = excluded.language,
       observations = excluded.observations, apply_regionalisms = excluded.apply_regionalisms`
  ).run({ ...profile, applyRegionalisms: profile.applyRegionalisms ? 1 : 0 });
  return getProfile();
}

export function getLlmSettings(): { apiKey: string; model: string } {
  const model = db().prepare("SELECT value FROM settings WHERE key = 'llm.model'").get() as
    | { value: string }
    | undefined;
  const encrypted = db().prepare("SELECT value FROM settings WHERE key = 'llm.apiKey'").get() as
    | { value: string }
    | undefined;
  let apiKey = process.env.OPENAI_API_KEY ?? "";
  if (encrypted && safeStorage.isEncryptionAvailable()) {
    apiKey = safeStorage.decryptString(Buffer.from(encrypted.value, "base64"));
  }
  return { apiKey, model: model?.value ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini" };
}

export function saveLlmSettings(input: { apiKey: string; model: string }): { model: string; configured: boolean } {
  const save = db().prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );
  save.run("llm.model", input.model);
  if (input.apiKey.trim()) {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("A criptografia segura do sistema não está disponível para salvar a chave.");
    }
    const encrypted = safeStorage.encryptString(input.apiKey.trim()).toString("base64");
    save.run("llm.apiKey", encrypted);
  }
  return { model: input.model, configured: Boolean(input.apiKey.trim() || process.env.OPENAI_API_KEY) };
}

export function closeDatabase(): void {
  database?.close();
  database = undefined;
}
