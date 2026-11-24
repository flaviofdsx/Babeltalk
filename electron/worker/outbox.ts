import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";
import type { MessageTransport, OutboxItem } from "../domain/types";
import { calculateBackoff } from "../domain/types";

export interface OutboxDeps {
  db: Database.Database;
  transport: MessageTransport;
  onStatusChange: (item: OutboxItem) => void;
}

export function enqueueOutbox(
  db: Database.Database,
  messageId: string,
  contactId: string,
  payload: { originalText: string; sentText: string; tone: string }
): OutboxItem {
  const item: OutboxItem = {
    id: randomUUID(),
    messageId,
    contactId,
    payloadJson: JSON.stringify(payload),
    status: "queued",
    retryCount: 0,
    nextRetryAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.prepare(
    `INSERT INTO message_outbox (id, message_id, contact_id, payload_json, status, retry_count, next_retry_at, created_at, updated_at)
     VALUES (@id, @messageId, @contactId, @payloadJson, @status, @retryCount, @nextRetryAt, @createdAt, @updatedAt)`
  ).run(item);

  return item;
}

export async function processOutbox(db: Database.Database, deps: OutboxDeps): Promise<void> {
  const now = new Date().toISOString();
  const pending = db
    .prepare(
      "SELECT * FROM message_outbox WHERE status IN ('queued', 'failed') AND (next_retry_at IS NULL OR next_retry_at <= ?) ORDER BY created_at ASC"
    )
    .all(now) as OutboxItem[];

  for (const item of pending) {
    const payload = JSON.parse(item.payloadJson) as {
      originalText: string;
      sentText: string;
      tone: string;
    };

    db.prepare("UPDATE message_outbox SET status = 'sending', updated_at = ? WHERE id = ?").run(
      now,
      item.id
    );
    deps.onStatusChange({ ...item, status: "sending" });

    let success = false;
    try {
      success = await deps.transport.send(item.contactId, payload);
    } catch {
      success = false;
    }

    if (success) {
      db.prepare("UPDATE message_outbox SET status = 'sent', updated_at = ? WHERE id = ?").run(
        now,
        item.id
      );
      deps.onStatusChange({ ...item, status: "sent", retryCount: item.retryCount });
    } else {
      const retryCount = item.retryCount + 1;
      const backoff = calculateBackoff(retryCount);
      const nextRetryAt = new Date(Date.now() + backoff).toISOString();
      db.prepare(
        "UPDATE message_outbox SET status = 'failed', retry_count = ?, next_retry_at = ?, updated_at = ? WHERE id = ?"
      ).run(retryCount, nextRetryAt, now, item.id);
      deps.onStatusChange({
        ...item,
        status: "failed",
        retryCount,
        nextRetryAt
      });
    }
  }
}

export function getOutboxForMessage(
  db: Database.Database,
  messageId: string
): OutboxItem | undefined {
  return db
    .prepare("SELECT * FROM message_outbox WHERE message_id = ? ORDER BY created_at DESC LIMIT 1")
    .get(messageId) as OutboxItem | undefined;
}

export function getPendingOutboxCount(db: Database.Database): number {
  const row = db
    .prepare("SELECT COUNT(*) AS count FROM message_outbox WHERE status IN ('queued', 'failed')")
    .get() as { count: number };
  return row.count;
}
