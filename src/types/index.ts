export type Tone = "formal" | "coloquial" | "descontraido" | "tosco" | "original";
export type SuggestionTone = Exclude<Tone, "original" | "tosco">;
export type Direction = "outgoing" | "incoming";
export type LlmProvider = "openai" | "openrouter";

export interface LlmSettingsSnapshot {
  provider: LlmProvider;
  model: string;
  configured: boolean;
  models: Record<LlmProvider, string>;
  configuredByProvider: Record<LlmProvider, boolean>;
}

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
  tone: SuggestionTone;
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
    suggest: (input: {
      text: string;
      contactId: string;
    }) => Promise<Record<SuggestionTone, string>>;
  };
}

declare global {
  interface Window {
    babelTalk: BabelTalkApi;
  }
}
