import type { Suggestion } from "../types";

interface SuggestionPickerProps {
  suggestions: Suggestion[];
  onChoose: (suggestion: Suggestion) => void;
  onDismiss: () => void;
  sending: boolean;
}

const toneInfo = {
  formal: { label: "Formal", hint: "Profissional", icon: "✧" },
  coloquial: { label: "Coloquial", hint: "Do dia a dia", icon: "☻" },
  tosco: { label: "Tosco", hint: "Bem informal", icon: "⚡" }
} as const;

export function SuggestionPicker({ suggestions, onChoose, onDismiss, sending }: SuggestionPickerProps) {
  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-[#dcebe6] bg-white shadow-panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#edf7f4] text-sm text-brand">✦</span>
          <div>
            <p className="text-sm font-semibold text-ink">Escolha como quer dizer</p>
            <p className="text-[11px] text-muted">Toque em uma opção para enviar</p>
          </div>
        </div>
        <button onClick={onDismiss} className="rounded-lg px-2 py-1 text-xs text-muted hover:bg-canvas" aria-label="Fechar sugestões">×</button>
      </div>
      <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {suggestions.map((suggestion) => {
          const info = toneInfo[suggestion.tone];
          return (
            <button
              key={suggestion.tone}
              disabled={sending}
              onClick={() => onChoose(suggestion)}
              className="group min-w-0 p-4 text-left transition hover:bg-[#f8fbfa] disabled:opacity-50"
            >
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-brand">{info.icon}</span>
                  <span className="text-sm font-semibold text-ink">{info.label}</span>
                </span>
                <span className="text-[10px] text-muted">{info.hint}</span>
              </span>
              <span className="mt-2 block max-h-24 overflow-y-auto whitespace-pre-wrap text-xs leading-5 text-[#596570]">
                {suggestion.text}
              </span>
              <span className="mt-3 block text-[11px] font-semibold text-brand opacity-0 transition group-hover:opacity-100">
                Enviar esta versão →
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
