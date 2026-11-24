import { create } from "zustand";
import type { Message, Tone } from "../types";

let latestLoad = 0;

interface MessagesState {
  messages: Message[];
  loading: boolean;
  load: (contactId: string) => Promise<void>;
  send: (contactId: string, text: string, tone: Tone) => Promise<Message>;
}

export const useMessagesStore = create<MessagesState>((set) => ({
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
  send: async (contactId, text, tone) => {
    const message = await window.babelTalk.messages.create({
      contactId,
      text,
      tone,
      direction: "outgoing"
    });
    set((state) => ({ messages: [...state.messages, message] }));
    return message;
  }
}));
