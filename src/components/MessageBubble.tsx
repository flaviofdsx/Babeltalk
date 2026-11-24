import type { Message, Tone } from "../types";

const toneLabels: Record<Tone, string> = {
  formal: "Formal",
  coloquial: "Coloquial",
  descontraido: "Descontraído",
  tosco: "Descontraído",
  original: "Original"
};

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const outgoing = message.direction === "outgoing";
  const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(message.createdAt)
  );
  return (
    <div className={`flex ${outgoing ? "justify-end" : "justify-start"}`}>
      <article
        className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[66%] ${
          outgoing
            ? "rounded-br-md bg-brand text-white"
            : "rounded-bl-md border border-line bg-white text-ink"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p>
        <div
          className={`mt-2 flex items-center justify-end gap-2 text-[10px] ${
            outgoing ? "text-white/70" : "text-muted"
          }`}
        >
          <span>{toneLabels[message.tone]}</span>
          <span>{time}</span>
          {outgoing && <span aria-label="Enviada">✓✓</span>}
        </div>
      </article>
    </div>
  );
}
