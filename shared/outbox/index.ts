// ============================================================
// Lógica de fila offline pura (sem dependências Node.js/Electron)
// Reutilizável em React Native
// ============================================================

import type { OutboxItem, OutboxPayload, MessageStatus } from "../types";
import { calculateBackoff } from "../types";

export interface OutboxStorage {
  insert(item: OutboxItem): void;
  updateStatus(
    id: string,
    status: MessageStatus,
    retryCount: number,
    nextRetryAt: string | null
  ): void;
  getPending(): OutboxItem[];
  getByMessageId(messageId: string): OutboxItem | undefined;
  getPendingCount(): number;
}

export interface OutboxProcessorDeps {
  storage: OutboxStorage;
  send: (contactId: string, payload: OutboxPayload) => Promise<boolean>;
  onStatusChange: (item: OutboxItem) => void;
}

export function createOutboxItem(
  id: string,
  messageId: string,
  contactId: string,
  payload: OutboxPayload
): OutboxItem {
  const now = new Date().toISOString();
  return {
    id,
    messageId,
    contactId,
    payloadJson: JSON.stringify(payload),
    status: "queued",
    retryCount: 0,
    nextRetryAt: now,
    createdAt: now,
    updatedAt: now
  };
}

export async function processPending(deps: OutboxProcessorDeps): Promise<void> {
  const pending = deps.storage.getPending();

  for (const item of pending) {
    const payload: OutboxPayload = JSON.parse(item.payloadJson);

    deps.storage.updateStatus(item.id, "sending", item.retryCount, null);
    deps.onStatusChange({ ...item, status: "sending" });

    let success = false;
    try {
      success = await deps.send(item.contactId, payload);
    } catch {
      success = false;
    }

    if (success) {
      deps.storage.updateStatus(item.id, "sent", item.retryCount, null);
      deps.onStatusChange({ ...item, status: "sent" });
    } else {
      const retryCount = item.retryCount + 1;
      const backoff = calculateBackoff(retryCount);
      const nextRetryAt = new Date(Date.now() + backoff).toISOString();
      deps.storage.updateStatus(item.id, "failed", retryCount, nextRetryAt);
      deps.onStatusChange({ ...item, status: "failed", retryCount, nextRetryAt });
    }
  }
}
