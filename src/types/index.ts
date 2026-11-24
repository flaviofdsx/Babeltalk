export type Tone = "formal" | "coloquial" | "tosco" | "original";
export type Direction = "outgoing" | "incoming";

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

export interface ContactInput {
  name: string;
  country: string;
  state: string;
  city: string;
  language: string;
  observations: string;
}

export interface Message {
  id: string;
  contactId: string;
  text: string;
  tone: Tone;
  direction: Direction;
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

export interface Suggestion {
  tone: Exclude<Tone, "original">;
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
    settings: () => Promise<{ model: string; configured: boolean }>;
    saveSettings: (settings: { apiKey?: string; model: string }) => Promise<{
      model: string;
      configured: boolean;
    }>;
    suggest: (input: { text: string; contactId: string }) => Promise<Record<Exclude<Tone, "original">, string>>;
  };
}

declare global {
  interface Window {
    babelTalk: BabelTalkApi;
  }
}
