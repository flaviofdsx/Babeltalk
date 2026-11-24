import { app, safeStorage } from "electron";
import Database from "better-sqlite3";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { defaultModels, runMigrations, type LlmProvider } from "./migrations";
export type { LlmProvider } from "./migrations";

export type Tone = "formal" | "coloquial" | "descontraido" | "tosco" | "original";
export type Direction = "outgoing" | "incoming";
export type MessageStatus = "queued" | "sending" | "sent" | "delivered" | "failed";

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
  originalText: string;
  text: string;
  tone: Tone;
  direction: Direction;
  status: MessageStatus;
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

export interface LlmSettings {
  provider: LlmProvider;
  model: string;
  apiKey: string;
}

export interface LlmSettingsSnapshot {
  provider: LlmProvider;
  model: string;
  configured: boolean;
  models: Record<LlmProvider, string>;
  configuredByProvider: Record<LlmProvider, boolean>;
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
  original_text: string;
  text: string;
  tone: Tone;
  direction: Direction;
  status: MessageStatus;
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

export function getDatabase(): Database.Database {
  return db();
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
    originalText: row.original_text,
    text: row.text,
    tone: row.tone,
    direction: row.direction,
    status: row.status ?? "sent",
    createdAt: row.created_at
  };
}

export function initializeDatabase(): void {
  const file = join(app.getPath("userData"), "babeltalk.sqlite");
  database = new Database(file);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  runMigrations(database);
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
  return (
    db()
      .prepare("SELECT * FROM messages WHERE contact_id = ? ORDER BY created_at ASC")
      .all(contactId) as MessageRow[]
  ).map(mapMessage);
}

export function createMessage(input: Omit<Message, "id" | "createdAt">): Message {
  const message: Message = {
    ...input,
    id: randomUUID(),
    status: input.status ?? "sent",
    createdAt: new Date().toISOString()
  };
  const storedMessage = {
    ...message,
    tone: message.tone === "descontraido" ? "tosco" : message.tone
  };
  db()
    .prepare(
      `INSERT INTO messages (id, contact_id, original_text, text, tone, direction, status, created_at)
       VALUES (@id, @contactId, @originalText, @text, @tone, @direction, @status, @createdAt)`
    )
    .run(storedMessage);
  return message;
}

export function updateMessageStatus(messageId: string, status: MessageStatus): void {
  db().prepare("UPDATE messages SET status = ? WHERE id = ?").run(status, messageId);
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
  db()
    .prepare(
      `INSERT INTO profile (id, name, country, state, city, language, observations, apply_regionalisms)
     VALUES (1, @name, @country, @state, @city, @language, @observations, @applyRegionalisms)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, country = excluded.country,
       state = excluded.state, city = excluded.city, language = excluded.language,
       observations = excluded.observations, apply_regionalisms = excluded.apply_regionalisms`
    )
    .run({ ...profile, applyRegionalisms: profile.applyRegionalisms ? 1 : 0 });
  return getProfile();
}

function readSetting(key: string): string | undefined {
  return (
    db().prepare("SELECT value FROM settings WHERE key = ?").get(key) as
      { value: string } | undefined
  )?.value;
}

function validProvider(value: string | undefined): value is LlmProvider {
  return value === "openai" || value === "openrouter";
}

function modelFor(provider: LlmProvider): string {
  const environmentModel =
    provider === "openai" ? process.env.OPENAI_MODEL : process.env.OPENROUTER_MODEL;
  return readSetting(`llm.model.${provider}`) ?? environmentModel ?? defaultModels[provider];
}

function environmentApiKeyFor(provider: LlmProvider): string {
  return provider === "openai"
    ? (process.env.OPENAI_API_KEY ?? "")
    : (process.env.OPENROUTER_API_KEY ?? "");
}

function storedApiKeyFor(provider: LlmProvider): string {
  const encrypted = readSetting(`llm.apiKey.${provider}`);
  if (!encrypted || !safeStorage.isEncryptionAvailable()) return "";
  return safeStorage.decryptString(Buffer.from(encrypted, "base64"));
}

function configuredFor(provider: LlmProvider): boolean {
  if (environmentApiKeyFor(provider).trim()) return true;
  return Boolean(readSetting(`llm.apiKey.${provider}`) && safeStorage.isEncryptionAvailable());
}

export function getLlmSettings(): LlmSettings {
  const storedProvider = readSetting("llm.provider");
  const provider = validProvider(storedProvider) ? storedProvider : "openrouter";
  const apiKey = storedApiKeyFor(provider) || environmentApiKeyFor(provider);
  return { provider, model: modelFor(provider), apiKey };
}

export function getLlmSettingsSnapshot(): LlmSettingsSnapshot {
  const { provider, model, apiKey } = getLlmSettings();
  return {
    provider,
    model,
    configured: Boolean(apiKey),
    models: {
      openai: modelFor("openai"),
      openrouter: modelFor("openrouter")
    },
    configuredByProvider: {
      openai: configuredFor("openai"),
      openrouter: configuredFor("openrouter")
    }
  };
}

export function saveLlmSettings(input: {
  provider: LlmProvider;
  apiKey: string;
  model: string;
}): LlmSettingsSnapshot {
  const trimmedApiKey = input.apiKey.trim();
  let encryptedKey: string | undefined;
  if (trimmedApiKey) {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("A criptografia segura do sistema não está disponível para salvar a chave.");
    }
    encryptedKey = safeStorage.encryptString(trimmedApiKey).toString("base64");
  }

  const upsert = db().prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );
  const save = db().transaction(() => {
    upsert.run("llm.provider", input.provider);
    upsert.run(`llm.model.${input.provider}`, input.model);
    if (encryptedKey) upsert.run(`llm.apiKey.${input.provider}`, encryptedKey);
  });
  save();
  return getLlmSettingsSnapshot();
}

export function closeDatabase(): void {
  database?.close();
  database = undefined;
}
