import type {
  Contact,
  Direction,
  LlmProvider,
  LlmSettingsSnapshot,
  Message,
  Profile,
  Tone
} from "./db";

export interface ContactInput {
  name: string;
  country: string;
  state: string;
  city: string;
  language: string;
  observations: string;
}

export interface Suggestion {
  tone: Exclude<Tone, "original" | "tosco">;
  text: string;
}

export interface BabelTalkApi {
  contacts: {
    list: () => Promise<Contact[]>;
    create: (input: ContactInput) => Promise<Contact>;
    update: (input: Contact & ContactInput) => Promise<Contact>;
    delete: (id: string) => Promise<void>;
  };
  messages: {
    list: (contactId: string) => Promise<Message[]>;
    create: (input: Omit<Message, "id" | "createdAt">) => Promise<Message>;
  };
  profile: {
    get: () => Promise<Profile>;
    save: (profile: Profile) => Promise<Profile>;
  };
  llm: {
    settings: () => Promise<LlmSettingsSnapshot>;
    saveSettings: (settings: {
      provider: LlmProvider;
      apiKey?: string;
      model: string;
    }) => Promise<LlmSettingsSnapshot>;
    suggest: (input: { text: string; contactId: string }) => Promise<{
      formal: string;
      coloquial: string;
      descontraido: string;
    }>;
  };
}

export type MessagePayload = Omit<Message, "id" | "createdAt"> & { direction: Direction };
