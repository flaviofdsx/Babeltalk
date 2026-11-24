import { createHash } from "node:crypto";
import type Database from "better-sqlite3";
import type { SuggestionCacheEntry, SuggestionContext } from "../domain/types";

function hashContext(ctx: SuggestionContext): string {
  const raw = [
    ctx.sourceLang,
    ctx.sourceRegion,
    ctx.targetLang,
    ctx.targetRegion,
    ctx.normalizedInput,
    ctx.applyRegionalisms ? "1" : "0"
  ].join("|");
  return createHash("sha256").update(raw).digest("hex");
}

export function buildCacheKey(ctx: SuggestionContext): string {
  return hashContext(ctx);
}

export function getCachedSuggestions(db: Database.Database, cacheKey: string): string | null {
  const row = db
    .prepare("SELECT result_json FROM suggestion_cache WHERE cache_key = ?")
    .get(cacheKey) as { resultJson: string } | undefined;

  if (row) {
    db.prepare("UPDATE suggestion_cache SET hit_count = hit_count + 1 WHERE cache_key = ?").run(
      cacheKey
    );
    return row.resultJson;
  }
  return null;
}

export function cacheSuggestions(
  db: Database.Database,
  cacheKey: string,
  resultJson: string
): void {
  const entry: SuggestionCacheEntry = {
    cacheKey,
    resultJson,
    createdAt: new Date().toISOString(),
    hitCount: 1
  };
  db.prepare(
    `INSERT OR IGNORE INTO suggestion_cache (cache_key, result_json, created_at, hit_count)
     VALUES (@cacheKey, @resultJson, @createdAt, @hitCount)`
  ).run(entry);
}
