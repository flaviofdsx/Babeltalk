import { useMemo, useState } from "react";
import { useContactsStore } from "../store/useContactsStore";
import type { Contact } from "../types";

interface ContactListProps {
  onAdd: () => void;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function ContactRow({ contact }: { contact: Contact }) {
  const selected = useContactsStore((state) => state.selectedContactId === contact.id);
  const select = useContactsStore((state) => state.select);
  const location = [contact.city, contact.state, contact.country].filter(Boolean).join(", ");
  return (
    <button
      onClick={() => select(contact.id)}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
        selected ? "bg-[#edf7f4]" : "hover:bg-canvas"
      }`}
    >
      <span
        style={{ backgroundColor: contact.avatarColor }}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-ink/70"
      >
        {initials(contact.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">{contact.name}</span>
        <span className="mt-1 block truncate text-xs text-muted">{location || contact.language}</span>
      </span>
      <span className="h-2 w-2 shrink-0 rounded-full bg-brand/70" />
    </button>
  );
}

export function ContactList({ onAdd }: ContactListProps) {
  const contacts = useContactsStore((state) => state.contacts);
  const loading = useContactsStore((state) => state.loading);
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => contacts.filter((contact) => contact.name.toLowerCase().includes(query.toLowerCase())),
    [contacts, query]
  );

  return (
    <section className="flex w-[300px] shrink-0 flex-col border-r border-line bg-white">
      <div className="px-5 pb-4 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">BabelTalk</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-ink">Conversas</h1>
          </div>
          <button onClick={onAdd} className="icon-button text-xl" aria-label="Adicionar contato" title="Adicionar contato">
            +
          </button>
        </div>
        <label className="mt-5 flex items-center gap-2 rounded-xl bg-canvas px-3 py-2.5 text-muted">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar conversas"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </label>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Mensagens recentes
        </div>
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-muted">Carregando conversas...</p>
        ) : filtered.length ? (
          filtered.map((contact) => <ContactRow key={contact.id} contact={contact} />)
        ) : (
          <div className="px-4 py-8 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-canvas text-xl">✉</div>
            <p className="text-sm font-semibold text-ink">{query ? "Nada por aqui" : "Sua conversa começa aqui"}</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              {query ? "Tente buscar por outro nome." : "Adicione alguém para começar a conversar."}
            </p>
            {!query && (
              <button onClick={onAdd} className="mt-4 text-sm font-semibold text-brand hover:text-brand-dark">
                Adicionar contato
              </button>
            )}
          </div>
        )}
      </div>
      <div className="mx-4 mb-4 rounded-xl bg-[#f0f7f5] p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand">
          <span>✦</span> Mensagens que falam sua língua
        </div>
        <p className="mt-1 text-[11px] leading-4 text-muted">Escolha o tom certo antes de enviar.</p>
      </div>
    </section>
  );
}
