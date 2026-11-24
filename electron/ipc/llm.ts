import { ipcMain } from "electron";
import { getContact, getProfile, getLlmSettingsSnapshot, type Contact, type Profile } from "../db";
import { suggest as adminSuggest } from "../llm/adminProxy";

export interface SuggestionsInput {
  text: string;
  contactId: string;
}

function location(profile: Pick<Profile, "city" | "state" | "country">): string {
  return [profile.city, profile.state, profile.country].filter(Boolean).join(", ");
}

export function registerLlmHandlers(): void {
  ipcMain.handle("llm:settings:get", () => {
    const snapshot = getLlmSettingsSnapshot();
    return {
      ...snapshot,
      configured: Boolean(process.env.ADMIN_OPENROUTER_API_KEY || process.env.ADMIN_LLM_PROXY_URL)
    };
  });

  ipcMain.handle("llm:settings:save", () => {
    return {
      provider: "openrouter",
      model: "admin",
      configured: true,
      models: { openai: "gpt-4o-mini", openrouter: "deepseek/deepseek-v4-flash" },
      configuredByProvider: { openai: false, openrouter: true }
    };
  });

  ipcMain.handle("llm:suggest", async (_event, input: SuggestionsInput) => {
    if (
      typeof input?.text !== "string" ||
      !input.text.trim() ||
      input.text.length > 5000 ||
      typeof input.contactId !== "string" ||
      !input.contactId
    ) {
      throw new Error("Escreva uma mensagem de até 5.000 caracteres e selecione um contato.");
    }

    const sender = getProfile();
    const recipient: Contact = getContact(input.contactId);

    return adminSuggest({
      text: input.text.trim(),
      sourceLang: sender.language,
      sourceRegion: location(sender),
      targetLang: recipient.language,
      targetRegion: location(recipient),
      applyRegionalisms: sender.applyRegionalisms,
      senderObservations: sender.observations,
      recipientName: recipient.name,
      recipientObservations: recipient.observations
    });
  });
}
