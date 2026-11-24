import { create } from "zustand";
import type { Message, Tone } from "../../shared/types";
import type { OutboxStorage } from "../../shared/outbox";
import { processPending, createOutboxItem, type OutboxProcessorDeps } from "../../shared/outbox";

let latestLoad = 0;

interface MessagesState {
  messages: Message[];
  loading: boolean;
  outboxStorage: OutboxStorage | null;
  transportSend:
    | ((
        contactId: string,
        payload: { originalText: string; sentText: string; tone: string }
      ) => Promise<boolean>)
    | null;
  load: (contactId: string) => Promise<void>;
  send: (contactId: string, originalText: string, sentText: string, tone: Tone) => Promise<Message>;
  updateMessageStatus: (messageId: string, status: Message["status"]) => void;
  configure: (
    storage: OutboxStorage,
    send: (
      contactId: string,
      payload: { originalText: string; sentText: string; tone: string }
    ) => Promise<boolean>
  ) => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [],
  loading: false,
  outboxStorage: null,
  transportSend: null,
  load: async (contactId) => {
    const requestId = ++latestLoad;
    set({ loading: true, messages: [] });
    try {
      // Em RN, carregar de AsyncStorage ou SQLite local
      const messages: Message[] = [];
      if (requestId === latestLoad) set({ messages });
    } finally {
      if (requestId === latestLoad) set({ loading: false });
    }
  },
  send: async (contactId, originalText, sentText, tone) => {
    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const message: Message = {
      id,
      contactId,
      originalText,
      sentText,
      tone,
      direction: "outgoing",
      status: "queued",
      createdAt: new Date().toISOString()
    };
    set((state) => ({ messages: [...state.messages, message] }));

    // Enfileira no outbox compartilhado (nunca chama IA no reenvio)
    const { outboxStorage, transportSend } = get();
    if (outboxStorage && transportSend) {
      const item = createOutboxItem(id, id, contactId, { originalText, sentText, tone });
      outboxStorage.insert(item);
      const deps: OutboxProcessorDeps = {
        storage: outboxStorage,
        send: transportSend,
        onStatusChange: (changed) => {
          get().updateMessageStatus(changed.messageId, changed.status);
        }
      };
      processPending(deps).catch(() => {});
    }

    return message;
  },
  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: state.messages.map((msg) => (msg.id === messageId ? { ...msg, status } : msg))
    }));
  },
  configure: (storage, send) => {
    set({ outboxStorage: storage, transportSend: send });
  }
}));
