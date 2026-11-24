import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import type { Contact, Suggestion, Tone } from "../types";
import { SuggestionPicker } from "./SuggestionPicker";

interface MessageComposerProps {
  contact: Contact;
  onSend: (text: string, tone: Tone) => Promise<void>;
}

export function MessageComposer({ contact, onSend }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const configured = useSettingsStore((state) => state.configured);
  const showSettings = useSettingsStore((state) => state.show);

  async function generate() {
    if (!text.trim()) return;
    if (!configured) {
      setError("Configure sua chave da OpenAI para criar as sugestões.");
      showSettings();
      return;
    }
    setGenerating(true);
    setError("");
    setSuggestions(null);
    try {
      const result = await window.babelTalk.llm.suggest({ text: text.trim(), contactId: contact.id });
      setSuggestions([
        { tone: "formal", text: result.formal },
        { tone: "coloquial", text: result.coloquial },
        { tone: "tosco", text: result.tosco }
      ]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível gerar sugestões.");
    } finally {
      setGenerating(false);
    }
  }

  async function send(value: string, tone: Tone) {
    setSending(true);
    setError("");
    try {
      await onSend(value, tone);
      setText("");
      setSuggestions(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível enviar a mensagem.");
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void generate();
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void generate();
  }

  return (
    <div className="border-t border-line bg-white px-4 pb-4 pt-3 sm:px-7">
      {suggestions && (
        <SuggestionPicker
          suggestions={suggestions}
          sending={sending}
          onChoose={(suggestion) => void send(suggestion.text, suggestion.tone)}
          onDismiss={() => setSuggestions(null)}
        />
      )}
      {error && (
        <div role="alert" className="mb-2 flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-3 font-semibold" aria-label="Dispensar aviso">×</button>
        </div>
      )}
      <form onSubmit={submit} className="flex items-end gap-2 rounded-2xl border border-line bg-[#fbfcfc] p-2 transition focus-within:border-[#a8d1c5] focus-within:ring-2 focus-within:ring-brand/10">
        <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg text-muted hover:bg-canvas" title="Em breve: anexar arquivo" aria-label="Anexar arquivo">
          +
        </button>
        <textarea
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setSuggestions(null);
            setError("");
          }}
          onKeyDown={onKeyDown}
          maxLength={5000}
          rows={1}
          placeholder={`Escreva para ${contact.name}...`}
          className="max-h-32 min-h-10 flex-1 resize-y bg-transparent py-2.5 text-sm leading-5 text-ink outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending || generating}
          className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-brand px-3 text-xs font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Enviar"
          title="Gerar sugestões antes de enviar"
        >
          {generating ? "Criando..." : sending ? "Enviando..." : "Enviar"}
        </button>
      </form>
      <p className="mt-2 text-center text-[10px] text-muted">
        Enviar mostra três sugestões. Escolha uma para enviar. <span className="hidden sm:inline">Enter envia · Shift + Enter para nova linha</span>
      </p>
    </div>
  );
}
