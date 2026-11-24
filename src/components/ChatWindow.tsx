import { useEffect, useMemo, useRef } from "react";
import { useMessagesStore } from "../store/useMessagesStore";
import { useSettingsStore } from "../store/useSettingsStore";
import type { Contact, Message, Tone } from "../types";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";

interface ChatWindowProps {
  contact: Contact | null;
}

export function ChatWindow({ contact }: ChatWindowProps) {
  const messages = useMessagesStore((state) => state.messages);
  const loading = useMessagesStore((state) => state.loading);
  const load = useMessagesStore((state) => state.load);
  const send = useMessagesStore((state) => state.send);
  const configured = useSettingsStore((state) => state.configured);
  const showSettings = useSettingsStore((state) => state.show);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeContactId = contact?.id;
  const location = useMemo(
    () => contact && [contact.city, contact.state, contact.country].filter(Boolean).join(", "),
    [contact]
  );

  useEffect(() => {
    if (activeContactId) void load(activeContactId);
  }, [activeContactId, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!contact) {
    return (
      <main className="grid flex-1 place-items-center bg-canvas">
        <div className="max-w-sm px-6 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-white text-3xl shadow-panel">
            ✉
          </div>
          <h2 className="mt-5 text-xl font-bold text-ink">Uma conversa começa com um oi</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Escolha um contato ou adicione alguém para começar. Depois, encontre o tom certo com
            ajuda da IA.
          </p>
        </div>
      </main>
    );
  }

  const contactId = contact.id;
  async function handleSend(originalText: string, sentText: string, tone: Tone) {
    await send(contactId, originalText, sentText, tone);
  }

  async function handleRetry(message: Message) {
    await send(contactId, message.originalText, message.text, message.tone);
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-canvas">
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-line bg-white px-5 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div
            style={{ backgroundColor: contact.avatarColor }}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold text-ink/70"
          >
            {contact.name
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-ink">{contact.name}</h2>
            <p className="mt-0.5 truncate text-xs text-muted">
              {location} · {contact.language}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex ${
              configured ? "bg-[#edf7f4] text-brand" : "bg-amber-50 text-amber-700"
            }`}
          >
            {configured ? "✦ IA pronta" : "IA não configurada"}
          </span>
          {!configured && (
            <button
              onClick={showSettings}
              className="text-xs font-semibold text-brand hover:text-brand-dark"
            >
              Configurar
            </button>
          )}
          <button className="icon-button" aria-label="Mais opções" title="Mais opções">
            ···
          </button>
        </div>
      </header>
      <section className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          <div className="self-center rounded-full bg-white/80 px-3 py-1 text-[10px] text-muted shadow-sm">
            Esta conversa fica salva neste dispositivo
          </div>
          {loading ? (
            <p className="py-12 text-center text-sm text-muted">Carregando mensagens...</p>
          ) : messages.length ? (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} onRetry={handleRetry} />
            ))
          ) : (
            <div className="my-auto py-16 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-sm">
                👋
              </div>
              <p className="mt-4 text-sm font-semibold text-ink">Diga oi para {contact.name}</p>
              <p className="mt-1 text-xs text-muted">
                Sua primeira mensagem pode ser escrita em qualquer tom.
              </p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </section>
      <MessageComposer key={contact.id} contact={contact} onSend={handleSend} />
    </main>
  );
}
