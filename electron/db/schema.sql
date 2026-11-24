PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Brasil',
  state TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'Português',
  observations TEXT NOT NULL DEFAULT '',
  avatar_color TEXT NOT NULL DEFAULT '#dcefe9',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  tone TEXT NOT NULL CHECK (tone IN ('formal', 'coloquial', 'tosco', 'original')),
  direction TEXT NOT NULL CHECK (direction IN ('outgoing', 'incoming')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS messages_contact_created
  ON messages(contact_id, created_at);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL DEFAULT 'Você',
  country TEXT NOT NULL DEFAULT 'Brasil',
  state TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'Português',
  observations TEXT NOT NULL DEFAULT '',
  apply_regionalisms INTEGER NOT NULL DEFAULT 1 CHECK (apply_regionalisms IN (0, 1))
);
