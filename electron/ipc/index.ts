import { registerContactHandlers } from "./contacts";
import { registerMessageHandlers } from "./messages";
import { registerLlmHandlers } from "./llm";

export function registerIpcHandlers(): void {
  registerContactHandlers();
  registerMessageHandlers();
  registerLlmHandlers();
}
