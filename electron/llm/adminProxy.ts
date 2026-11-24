// ============================================================
// Proxy administrado para chamadas de IA
// A chave do OpenRouter é gerenciada pelo administrador,
// nunca exposta ao usuário final nem ao renderer.
// ============================================================

import OpenAI from "openai";
import { createHash } from "node:crypto";
import { getDatabase } from "../db";
import { getCachedSuggestions, cacheSuggestions } from "../db/suggestionCache";

const ADMIN_API_KEY = process.env.ADMIN_OPENROUTER_API_KEY ?? "";
const ADMIN_PROXY_URL = process.env.ADMIN_LLM_PROXY_URL ?? "";
const DEFAULT_MODEL = process.env.ADMIN_LLM_MODEL ?? "deepseek/deepseek-v4-flash";

interface SuggestionContext {
  sourceLang: string;
  sourceRegion: string;
  targetLang: string;
  targetRegion: string;
  normalizedInput: string;
  applyRegionalisms: boolean;
  senderObservations: string;
  recipientName: string;
  recipientObservations: string;
}

export interface Suggestions {
  formal: string;
  coloquial: string;
  descontraido: string;
}

function buildCacheKey(ctx: SuggestionContext): string {
  const raw = [
    ctx.sourceLang,
    ctx.sourceRegion,
    ctx.targetLang,
    ctx.targetRegion,
    ctx.normalizedInput,
    ctx.applyRegionalisms ? "1" : "0",
    ctx.senderObservations,
    ctx.recipientName,
    ctx.recipientObservations
  ].join("|");
  return createHash("sha256").update(raw).digest("hex");
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
  if (
    keys.length !== 3 ||
    !["formal", "coloquial", "descontraido"].every((key) => keys.includes(key))
  ) {
    throw new Error("O modelo não retornou exatamente as três sugestões esperadas.");
  }
  const result = parsed as Record<string, unknown>;
  for (const tone of ["formal", "coloquial", "descontraido"] as const) {
    if (typeof result[tone] !== "string" || !result[tone].trim()) {
      throw new Error("O modelo retornou uma sugestão vazia ou inválida.");
    }
  }
  return {
    formal: (result.formal as string).trim(),
    coloquial: (result.coloquial as string).trim(),
    descontraido: (result.descontraido as string).trim()
  };
}

function location(city: string, state: string, country: string): string {
  return [city, state, country].filter(Boolean).join(", ");
}

export async function suggest(input: {
  text: string;
  sourceLang: string;
  sourceRegion: string;
  targetLang: string;
  targetRegion: string;
  applyRegionalisms: boolean;
  senderObservations: string;
  recipientName: string;
  recipientObservations: string;
}): Promise<Suggestions> {
  const ctx: SuggestionContext = {
    sourceLang: input.sourceLang,
    sourceRegion: input.sourceRegion,
    targetLang: input.targetLang,
    targetRegion: input.targetRegion,
    normalizedInput: input.text.trim(),
    applyRegionalisms: input.applyRegionalisms,
    senderObservations: input.senderObservations,
    recipientName: input.recipientName,
    recipientObservations: input.recipientObservations
  };

  // 1. Verifica cache local
  const cacheKey = buildCacheKey(ctx);
  try {
    const cached = getCachedSuggestions(getDatabase(), cacheKey);
    if (cached) return parseSuggestions(cached);
  } catch {
    // Cache indisponível — segue sem
  }

  // 2. Se há um proxy URL configurado, usa ele
  if (ADMIN_PROXY_URL) {
    const response = await fetch(ADMIN_PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ctx)
    });
    if (!response.ok) {
      throw new Error("O serviço de IA do administrador não está disponível.");
    }
    const result = parseSuggestions(await response.text());
    try {
      cacheSuggestions(getDatabase(), cacheKey, JSON.stringify(result));
    } catch {
      // Falha no cache não bloqueia
    }
    return result;
  }

  // 3. Fallback: chamada direta com chave do admin (nunca exposta ao renderer)
  if (!ADMIN_API_KEY) {
    throw new Error(
      "IA não configurada pelo administrador. Solicite ao administrador que configure a chave do OpenRouter."
    );
  }

  const openai = new OpenAI({
    apiKey: ADMIN_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://github.com/flaviofdsx/Babeltalk",
      "X-Title": "BabelTalk"
    }
  });

  const senderLocation = location(
    input.sourceRegion.split(", ")[0] ?? "",
    input.sourceRegion.split(", ")[1] ?? "",
    input.sourceRegion.split(", ")[2] ?? ""
  );
  const recipientLocation = location(
    input.targetRegion.split(", ")[0] ?? "",
    input.targetRegion.split(", ")[1] ?? "",
    input.targetRegion.split(", ")[2] ?? ""
  );

  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature: 0.8,
    max_tokens: 600,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          `Você é um assistente de escrita. Gere exatamente três versões da mensagem:`,
          `formal (profissional), coloquial (natural) e descontraido (informal, com gírias).`,
          `Preserve a intenção e os fatos; não invente detalhes.`,
          `O idioma de destino é "${input.targetLang}".`,
          input.applyRegionalisms
            ? `Aplique regionalismos com moderação, priorizando a região "${input.targetRegion}".`
            : "Não acrescente gírias nem expressões regionais; use a variante neutra do idioma de destino.",
          `Responda exclusivamente JSON com as chaves "formal", "coloquial" e "descontraido", cada uma com uma string não vazia.`
        ].join(" ")
      },
      {
        role: "user",
        content: JSON.stringify({
          message: input.text.trim(),
          sender: { location: senderLocation, language: input.sourceLang },
          recipient: {
            name: input.recipientName,
            location: recipientLocation,
            language: input.targetLang
          }
        })
      }
    ]
  });

  const content = response.choices[0]?.message.content;
  if (!content) throw new Error("O modelo não retornou conteúdo. Tente novamente.");

  const result = parseSuggestions(content);
  try {
    cacheSuggestions(getDatabase(), cacheKey, JSON.stringify(result));
  } catch {
    // Falha no cache não bloqueia
  }
  return result;
}
