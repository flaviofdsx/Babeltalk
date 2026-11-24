import type { Message, Tone } from "../types";

const toneLabels: Record<Tone, string> = {
  formal: "Formal",
  coloquial: "Coloquial",
  descontraido: "Descontraído",
  tosco: "Descontraído",
  original: "Original"
};

const statusIcons: Record<Message["status"], { icon: string; label: string }> = {
  queued: { icon: "⏳", label: "Na fila" },
  sending: { icon: "📤", label: "Enviando..." },
  sent: { icon: "✓✓", label: "Enviada" },
  delivered: { icon: "✓✓", label: "Entregue" },
  failed: { icon: "⚠", label: "Falha no envio" }
};

interface MessageBubbleProps {
  message: Message;
  onRetry?: (message: Message) => void;
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const outgoing = message.direction === "outgoing";
  const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(message.createdAt)
  );
  const hasAdaptation = outgoing && message.originalText !== message.text;
  const statusInfo = statusIcons[message.status ?? "sent"];

  return (
    <div className={`flex ${outgoing ? "justify-end" : "justify-start"}`}>
      <article
        className={`group relative max-w-[78%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[66%] ${
          outgoing
            ? "rounded-br-md bg-brand text-white"
            : "rounded-bl-md border border-line bg-white text-ink"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.originalText || message.text}
        </p>
        <div
          className={`mt-2 flex items-center justify-end gap-2 text-[10px] ${
            outgoing ? "text-white/70" : "text-muted"
          }`}
        >
          {hasAdaptation && (
            <span
              className="relative cursor-help"
              title={`Enviado como: ${message.text} (${toneLabels[message.tone]})`}
            >
              <span aria-label="Traduzido/adaptado" className="text-[11px]">
                ◇
              </span>
              <span className="invisible group-hover:visible absolute bottom-full right-0 mb-1.5 w-56 rounded-lg bg-[#2d3a35] px-3 py-2 text-[11px] leading-4 text-white shadow-lg transition-opacity">
                Enviado como: {message.text} ({toneLabels[message.tone]})
              </span>
            </span>
          )}
          <span>{toneLabels[message.tone]}</span>
          <span>{time}</span>
          {outgoing && (
            <span
              className={
                message.status === "failed"
                  ? "cursor-pointer text-amber-300 hover:text-amber-200"
                  : ""
              }
              title={statusInfo.label}
              onClick={() => {
                if (message.status === "failed" && onRetry) {
                  onRetry(message);
                }
              }}
              aria-label={statusInfo.label}
            >
              {statusInfo.icon}
            </span>
          )}
        </div>
      </article>
    </div>
  );
}
