import { useState } from "react";
import { ContactForm } from "../components/ContactForm";
import { useContactsStore } from "../store/useContactsStore";
import type { Contact, ContactInput } from "../types";

interface ContactsPageProps {
  onOpenChat: () => void;
}

export function ContactsPage({ onOpenChat }: ContactsPageProps) {
  const contacts = useContactsStore((state) => state.contacts);
  const add = useContactsStore((state) => state.add);
  const update = useContactsStore((state) => state.update);
  const remove = useContactsStore((state) => state.remove);
  const select = useContactsStore((state) => state.select);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function save(input: ContactInput) {
    if (editing) await update({ ...editing, ...input });
    else await add(input);
  }

  async function deleteContact(contact: Contact) {
    if (!window.confirm(`Remover ${contact.name} e todo o histórico desta conversa?`)) return;
    setError("");
    try {
      await remove(contact.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível remover o contato.");
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-canvas">
      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Sua agenda</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Contatos</h1>
            <p className="mt-1 text-sm text-muted">Perfis de idioma e localização para conversas mais naturais.</p>
          </div>
          <button onClick={() => setAdding(true)} className="button-primary">+ Novo contato</button>
        </div>
        {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-7 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {contacts.length ? contacts.map((contact) => {
            const location = [contact.city, contact.state, contact.country].filter(Boolean).join(", ");
            return (
              <article key={contact.id} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-b-0">
                <div style={{ backgroundColor: contact.avatarColor }} className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-bold text-ink/70">
                  {contact.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold text-ink">{contact.name}</h2>
                  <p className="mt-1 truncate text-xs text-muted">{location || "Localização não informada"} · {contact.language}</p>
                </div>
                <button
                  onClick={() => {
                    select(contact.id);
                    onOpenChat();
                  }}
                  className="button-secondary hidden sm:inline-flex"
                >
                  Conversar
                </button>
                <button onClick={() => setEditing(contact)} className="icon-button" aria-label={`Editar ${contact.name}`} title="Editar">✎</button>
                <button onClick={() => void deleteContact(contact)} className="icon-button text-red-500 hover:bg-red-50" aria-label={`Remover ${contact.name}`} title="Remover">×</button>
              </article>
            );
          }) : (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-canvas text-2xl">♙</div>
              <h2 className="mt-4 text-sm font-semibold text-ink">Nenhum contato ainda</h2>
              <p className="mt-1 text-sm text-muted">Adicione um perfil para começar uma conversa.</p>
              <button onClick={() => setAdding(true)} className="button-primary mt-5">Adicionar contato</button>
            </div>
          )}
        </div>
        <div className="mt-5 rounded-xl border border-[#dcebe6] bg-[#f0f7f5] p-4">
          <p className="text-xs leading-5 text-[#526b63]">
            <strong className="text-brand">Dica:</strong> informe país, região e idioma do contato. O BabelTalk usa esses dados para traduzir e adaptar expressões nas sugestões.
          </p>
        </div>
      </div>
      {(adding || editing) && (
        <ContactForm
          contact={editing ?? undefined}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSave={save}
        />
      )}
    </main>
  );
}
