import { create } from "zustand";
import type { LlmProvider, LlmSettingsSnapshot, Profile } from "../types";

interface SettingsState {
  profile: Profile;
  provider: LlmProvider;
  model: string;
  configured: boolean;
  models: LlmSettingsSnapshot["models"];
  configuredByProvider: LlmSettingsSnapshot["configuredByProvider"];
  open: boolean;
  loading: boolean;
  load: () => Promise<void>;
  show: () => void;
  hide: () => void;
  saveProfile: (profile: Profile) => Promise<void>;
  saveLlm: (provider: LlmProvider, apiKey: string, model: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  profile: {
    name: "Você",
    country: "Brasil",
    state: "",
    city: "",
    language: "Português",
    observations: "",
    applyRegionalisms: true
  },
  provider: "openrouter",
  model: "deepseek/deepseek-v4-flash",
  configured: false,
  models: {
    openai: "gpt-4o-mini",
    openrouter: "deepseek/deepseek-v4-flash"
  },
  configuredByProvider: { openai: false, openrouter: false },
  open: false,
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const [profile, llm] = await Promise.all([
        window.babelTalk.profile.get(),
        window.babelTalk.llm.settings()
      ]);
      set({
        profile,
        provider: llm.provider,
        model: llm.model,
        configured: llm.configured,
        models: llm.models,
        configuredByProvider: llm.configuredByProvider
      });
    } finally {
      set({ loading: false });
    }
  },
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
  saveProfile: async (profile) => {
    const saved = await window.babelTalk.profile.save(profile);
    set({ profile: saved });
  },
  saveLlm: async (provider, apiKey, model) => {
    const saved = await window.babelTalk.llm.saveSettings({ provider, apiKey, model });
    set({
      provider: saved.provider,
      model: saved.model,
      configured: saved.configured,
      models: saved.models,
      configuredByProvider: saved.configuredByProvider
    });
  }
}));
