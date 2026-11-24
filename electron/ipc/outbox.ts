import { ipcMain } from "electron";
import { getDatabase, updateMessageStatus } from "../db";
import { enqueueOutbox, getOutboxForMessage, getPendingOutboxCount } from "../worker/outbox";

export function registerOutboxHandlers(): void {
  ipcMain.handle(
    "outbox:enqueue",
    (
      _event,
      input: {
        messageId: string;
        contactId: string;
        originalText: string;
        sentText: string;
        tone: string;
      }
    ) => {
      const db = getDatabase();
      const item = enqueueOutbox(db, input.messageId, input.contactId, {
        originalText: input.originalText,
        sentText: input.sentText,
        tone: input.tone
      });
      updateMessageStatus(input.messageId, "queued");
      return item;
    }
  );

  ipcMain.handle("outbox:status", (_event, messageId: unknown) => {
    if (typeof messageId !== "string") return null;
    const db = getDatabase();
    return getOutboxForMessage(db, messageId) ?? null;
  });

  ipcMain.handle("outbox:pendingCount", () => {
    const db = getDatabase();
    return getPendingOutboxCount(db);
  });
}
