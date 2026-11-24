import { registerContactHandlers } from "./contacts";
import { registerMessageHandlers } from "./messages";
import { registerLlmHandlers } from "./llm";
import { registerOutboxHandlers } from "./outbox";

export function registerIpcHandlers(): void {
  registerContactHandlers();
  registerMessageHandlers();
  registerLlmHandlers();
  registerOutboxHandlers();
}
