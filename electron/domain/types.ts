export type MessageStatus = "queued" | "sending" | "sent" | "delivered" | "failed";

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

export interface SuggestionCacheEntry {
  cacheKey: string;
  resultJson: string;
  createdAt: string;
  hitCount: number;
}

export interface SuggestionContext {
  sourceLang: string;
  sourceRegion: string;
  targetLang: string;
  targetRegion: string;
  normalizedInput: string;
  applyRegionalisms: boolean;
}

export interface MessageTransport {
  send(
    contactId: string,
    payload: { originalText: string; sentText: string; tone: string }
  ): Promise<boolean>;
}

export function calculateBackoff(retryCount: number): number {
  return Math.min(5000 * 2 ** retryCount, 160_000);
}
