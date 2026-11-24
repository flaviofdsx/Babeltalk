import { ipcMain } from "electron";
import { createMessage, listMessages, type Message, type Tone } from "../db";

const tones: Tone[] = ["formal", "coloquial", "tosco", "original"];

export function registerMessageHandlers(): void {
  ipcMain.handle("messages:list", (_event, contactId: unknown) => {
    if (typeof contactId !== "string" || !contactId) throw new Error("Contato inválido.");
    return listMessages(contactId);
  });
  ipcMain.handle("messages:create", (_event, input: Partial<Message>) => {
    if (typeof input.contactId !== "string" || !input.contactId) {
      throw new Error("Contato inválido.");
    }
    if (typeof input.text !== "string" || !input.text.trim() || input.text.length > 10000) {
      throw new Error("A mensagem deve ter entre 1 e 10.000 caracteres.");
    }
    if (input.direction !== "outgoing" && input.direction !== "incoming") {
      throw new Error("Direção da mensagem inválida.");
    }
    if (!input.tone || !tones.includes(input.tone)) throw new Error("Tom da mensagem inválido.");
    return createMessage({
      contactId: input.contactId,
      text: input.text.trim(),
      tone: input.tone,
      direction: input.direction
    });
  });
}
