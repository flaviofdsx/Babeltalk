import OpenAI from "openai";
import { ipcMain } from "electron";
import {
  getLlmSettings,
  getContact,
  getProfile,
  saveLlmSettings,
  type Contact,
  type Profile
} from "../db";

export interface SuggestionsInput {
  text: string;
  contactId: string;
}

export interface Suggestions {
  formal: string;
  coloquial: string;
  tosco: string;
}

function parseSuggestions(value: string): Suggestions {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("O modelo retornou sugestões em um formato inválido. Tente novamente.");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("O modelo não retornou um objeto de sugestões válido.");
  }
  const keys = Object.keys(parsed);
  if (keys.length !== 3 || !["formal", "coloquial", "tosco"].every((key) => keys.includes(key))) {
    throw new Error("O modelo não retornou exatamente as três sugestões esperadas.");
  }
  const result = parsed as Record<string, unknown>;
  for (const tone of ["formal", "coloquial", "tosco"] as const) {
    if (typeof result[tone] !== "string" || !result[tone].trim()) {
      throw new Error("O modelo retornou uma sugestão vazia ou inválida.");
    }
  }
  return {
    formal: (result.formal as string).trim(),
    coloquial: (result.coloquial as string).trim(),
    tosco: (result.tosco as string).trim()
  };
}

function location(profile: Pick<Profile, "city" | "state" | "country">): string {
  return [profile.city, profile.state, profile.country].filter(Boolean).join(", ");
}

export function registerLlmHandlers(): void {
  ipcMain.handle("llm:settings:get", () => {
    const settings = getLlmSettings();
    return { model: settings.model, configured: Boolean(settings.apiKey) };
  });
  ipcMain.handle(
    "llm:settings:save",
    (_event, input: { apiKey?: unknown; model?: unknown }) => {
      if (typeof input.model !== "string" || !input.model.trim() || input.model.length > 100) {
        throw new Error("Informe um identificador de modelo válido.");
      }
      if (input.apiKey !== undefined && typeof input.apiKey !== "string") {
        throw new Error("A chave da API deve ser texto.");
      }
      const model = input.model.trim();
      const apiKey = typeof input.apiKey === "string" ? input.apiKey : "";
      return saveLlmSettings({ apiKey, model });
    }
  );
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
    const { apiKey, model } = getLlmSettings();
    if (!apiKey) throw new Error("Configure sua chave da OpenAI em Configurações para gerar sugestões.");

    const sender = getProfile();
    const recipient: Contact = getContact(input.contactId);
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model,
      temperature: 0.8,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "babeltalk_suggestions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              formal: { type: "string" },
              coloquial: { type: "string" },
              tosco: { type: "string" }
            },
            required: ["formal", "coloquial", "tosco"],
            additionalProperties: false
          }
        }
      },
      messages: [
        {
          role: "system",
          content:
            `Você é um assistente de escrita e tradução. Gere exatamente três versões da mensagem: formal (profissional), coloquial (natural) e tosco (bem informal, com gírias apropriadas, sem insultos). Preserve a intenção e os fatos; não invente detalhes. O idioma de destino é o idioma principal do destinatário. Se for diferente do idioma da mensagem, traduza cada versão mantendo seu tom. ${
              sender.applyRegionalisms
                ? "Aplique regionalismos com moderação e naturalidade, priorizando a região do destinatário e usando a origem do remetente apenas como contexto."
                : "Não acrescente gírias nem expressões regionais; use a variante neutra do idioma de destino."
            } Use observações dos perfis somente como contexto relevante, sem repeti-las na resposta. Responda exclusivamente com um objeto JSON contendo exatamente as chaves "formal", "coloquial" e "tosco", cada uma com o texto da respectiva sugestão.`
        },
        {
          role: "user",
          content: JSON.stringify({
            message: input.text.trim(),
            sender: {
              location: location(sender),
              language: sender.language,
              observations: sender.observations,
              applyRegionalisms: sender.applyRegionalisms
            },
            recipient: {
              name: recipient.name,
              location: location(recipient),
              language: recipient.language,
              observations: recipient.observations
            }
          })
        }
      ]
    });
    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("O modelo não retornou conteúdo. Tente novamente.");
    return parseSuggestions(content);
  });
}
