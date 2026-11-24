// ============================================================
// Tipos compartilhados entre Electron e React Native
// NÃO importar módulos Node.js ou Electron aqui
// ============================================================

export type Tone = "formal" | "coloquial" | "descontraido" | "original";
export type Direction = "outgoing" | "incoming";
export type MessageStatus = "queued" | "sending" | "sent" | "delivered" | "failed";

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

export interface Message {
  id: string;
  contactId: string;
  originalText: string;
  sentText: string;
  tone: Tone;
  direction: Direction;
  status: MessageStatus;
  createdAt: string;
}

export interface OutboxItem {
  id: string;
  messageId: string;
  contactId: string;
  payloadJson: string;
  status: MessageStatus;
  retryCount: number;
  nextRetryAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OutboxPayload {
  originalText: string;
  sentText: string;
  tone: string;
}

export interface MessageTransport {
  send(contactId: string, payload: OutboxPayload): Promise<boolean>;
}

export interface SuggestionInput {
  text: string;
  sourceLang: string;
  sourceRegion: string;
  targetLang: string;
  targetRegion: string;
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

export function calculateBackoff(retryCount: number): number {
  return Math.min(5000 * 2 ** retryCount, 160_000);
}
