import { create } from "zustand";
import type { Message, Tone } from "../types";

let latestLoad = 0;

interface MessagesState {
  messages: Message[];
  loading: boolean;
  load: (contactId: string) => Promise<void>;
  send: (contactId: string, originalText: string, sentText: string, tone: Tone) => Promise<Message>;
  updateMessageStatus: (messageId: string, status: Message["status"]) => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [],
  loading: false,
  load: async (contactId) => {
    const requestId = ++latestLoad;
    set({ loading: true, messages: [] });
    try {
      const messages = await window.babelTalk.messages.list(contactId);
      if (requestId === latestLoad) set({ messages });
    } finally {
      if (requestId === latestLoad) set({ loading: false });
    }
  },
  send: async (contactId, originalText, sentText, tone) => {
    const message = await window.babelTalk.messages.create({
      contactId,
      originalText,
      text: sentText,
      tone,
      direction: "outgoing",
      status: "queued"
    });
    set((state) => ({ messages: [...state.messages, message] }));

    // Enfileira no outbox (nunca chama a IA novamente no reenvio)
    try {
      await window.babelTalk.outbox.enqueue({
        messageId: message.id,
        contactId,
        originalText,
        sentText,
        tone
      });
    } catch {
      // Se falhar ao enfileirar, marca como sent (apenas local)
      get().updateMessageStatus(message.id, "sent");
    }

    return message;
  },
  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: state.messages.map((msg) => (msg.id === messageId ? { ...msg, status } : msg))
    }));
  }
}));
