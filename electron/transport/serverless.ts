import type { MessageTransport } from "../domain/types";

/**
 * Transporte serverless simulado.
 * Em produção, esta classe seria substituída por WebSocket, HTTP polling
 * ou um serviço de fila (ex.: Azure Queue, SQS).
 *
 * A implementação real deve:
 * 1. Tentar entregar a mensagem ao destinatário.
 * 2. Retornar `true` se entregue com sucesso, `false` se offline/falha.
 */
export class ServerlessTransport implements MessageTransport {
  async send(
    _contactId: string,
    _payload: { originalText: string; sentText: string; tone: string }
  ): Promise<boolean> {
    // Simula entrega: 80% de chance de sucesso na primeira tentativa.
    // Em produção, substituir por chamada HTTP/WebSocket real.
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Math.random() > 0.2;
  }
}

export function createTransport(): MessageTransport {
  return new ServerlessTransport();
}
