import { useState, type FormEvent } from "react";
import type { Contact, ContactInput } from "../types";
import { LocationFields } from "./LocationFields";

interface ContactFormProps {
  contact?: Contact;
  onClose: () => void;
  onSave: (input: ContactInput) => Promise<void>;
}

const empty: ContactInput = {
  name: "",
  country: "Brasil",
  state: "",
  city: "",
  language: "Português",
  observations: ""
};

export function ContactForm({ contact, onClose, onSave }: ContactFormProps) {
  const [form, setForm] = useState<ContactInput>(
    contact
      ? {
          name: contact.name,
          country: contact.country,
          state: contact.state,
          city: contact.city,
          language: contact.language,
          observations: contact.observations
        }
      : empty
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar o contato.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form onSubmit={submit} className="modal-card max-w-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Sua agenda</p>
            <h2 className="mt-1 text-xl font-bold text-ink">{contact ? "Editar contato" : "Novo contato"}</h2>
            <p className="mt-1 text-sm text-muted">A localização ajuda a adaptar expressões e idioma.</p>
          </div>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Fechar">×</button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="field-label sm:col-span-2">
            Nome
            <input required maxLength={80} autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field-input" placeholder="Ex.: Marina Costa" />
          </label>
          <LocationFields
            value={form}
            onChange={(location) => setForm({ ...form, ...location })}
          />
          <label className="field-label sm:col-span-2">
            Observações
            <textarea
              maxLength={1000}
              rows={3}
              value={form.observations}
              onChange={(event) => setForm({ ...form, observations: event.target.value })}
              className="field-input min-h-20 resize-y py-2"
              placeholder="Preferências de linguagem ou contexto para esta conversa"
            />
          </label>
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="button-secondary">Cancelar</button>
          <button disabled={saving} className="button-primary">{saving ? "Salvando..." : contact ? "Salvar alterações" : "Adicionar contato"}</button>
        </div>
      </form>
    </div>
  );
}
