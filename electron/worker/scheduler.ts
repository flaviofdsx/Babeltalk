import type Database from "better-sqlite3";
import type { MessageTransport, OutboxItem } from "../domain/types";
import { processOutbox, getPendingOutboxCount } from "./outbox";

export interface SchedulerDeps {
  db: Database.Database;
  transport: MessageTransport;
  onStatusChange: (item: OutboxItem) => void;
}

export class OutboxScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;
  private deps: SchedulerDeps;
  private running = false;

  constructor(deps: SchedulerDeps) {
    this.deps = deps;
  }

  start(): void {
    if (this.running) return;
    this.running = true;

    // Processa imediatamente ao iniciar
    this.tick();

    // Depois a cada 15 segundos
    this.timer = setInterval(() => this.tick(), 15_000);
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async tick(): Promise<void> {
    try {
      const count = getPendingOutboxCount(this.deps.db);
      if (count === 0) return;
      await processOutbox(this.deps.db, this.deps);
    } catch (error) {
      console.error("[OutboxScheduler] Erro ao processar fila:", error);
    }
  }
}
