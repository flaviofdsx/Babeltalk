import { create } from "zustand";
import type { Profile } from "../types";

interface SettingsState {
  profile: Profile;
  model: string;
  configured: boolean;
  open: boolean;
  loading: boolean;
  load: () => Promise<void>;
  show: () => void;
  hide: () => void;
  saveProfile: (profile: Profile) => Promise<void>;
  saveLlm: (apiKey: string, model: string) => Promise<void>;
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
  model: "gpt-4o-mini",
  configured: false,
  open: false,
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const [profile, llm] = await Promise.all([
        window.babelTalk.profile.get(),
        window.babelTalk.llm.settings()
      ]);
      set({ profile, model: llm.model, configured: llm.configured });
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
  saveLlm: async (apiKey, model) => {
    const saved = await window.babelTalk.llm.saveSettings({ apiKey, model });
    set({ model: saved.model, configured: saved.configured });
  }
}));
