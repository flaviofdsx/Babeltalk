import { useEffect, useState, type FormEvent } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import type { LlmProvider, Profile } from "../types";
import { LocationFields } from "./LocationFields";

export function SettingsModal() {
  const open = useSettingsStore((state) => state.open);
  const hide = useSettingsStore((state) => state.hide);
  const profile = useSettingsStore((state) => state.profile);
  const savedProvider = useSettingsStore((state) => state.provider);
  const model = useSettingsStore((state) => state.model);
  const models = useSettingsStore((state) => state.models);
  const configuredByProvider = useSettingsStore((state) => state.configuredByProvider);
  const saveProfile = useSettingsStore((state) => state.saveProfile);
  const saveLlm = useSettingsStore((state) => state.saveLlm);
  const [form, setForm] = useState<Profile>(profile);
  const [provider, setProvider] = useState<LlmProvider>(savedProvider);
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState(model);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const providerConfigured = configuredByProvider[provider];

  useEffect(() => {
    setForm(profile);
    setProvider(savedProvider);
    setModelName(model);
  }, [profile, savedProvider, model, models, open]);

  if (!open) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await saveProfile(form);
      await saveLlm(provider, apiKey, modelName);
      setApiKey("");
      setNotice("Configurações salvas neste dispositivo.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Não foi possível salvar as configurações."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && hide()}
    >
      <form onSubmit={submit} className="modal-card max-w-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Personalize o BabelTalk</p>
            <h2 className="mt-1 text-xl font-bold text-ink">Configurações</h2>
          </div>
          <button type="button" onClick={hide} className="icon-button" aria-label="Fechar">
            ×
          </button>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-ink">Seu perfil</h3>
          <p className="mt-1 text-xs text-muted">Usado como contexto para adaptar as sugestões.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="field-label sm:col-span-2">
              Seu nome
              <input
                required
                maxLength={80}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="field-input"
              />
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
                placeholder="Contexto opcional sobre seu estilo de comunicação"
              />
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-line p-3 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.applyRegionalisms}
                onChange={(event) => setForm({ ...form, applyRegionalisms: event.target.checked })}
                className="mt-0.5 h-4 w-4 accent-brand"
              />
              <span>
                <span className="block text-xs font-semibold text-ink">Aplicar regionalismos</span>
                <span className="mt-1 block text-[11px] leading-4 text-muted">
                  Permite que as sugestões usem expressões naturais da região do destinatário.
                </span>
              </span>
            </label>
          </div>
        </div>
        <div className="mt-6 border-t border-line pt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Inteligência artificial</h3>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                providerConfigured ? "bg-[#edf7f4] text-brand" : "bg-amber-50 text-amber-700"
              }`}
            >
              {providerConfigured ? "Conectada" : "Não configurada"}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">
            Selecione o provedor. A chave correspondente é criptografada pelo sistema operacional e
            usada somente no processo principal.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="field-label sm:col-span-2">
              Provedor
              <select
                value={provider}
                onChange={(event) => {
                  const nextProvider = event.target.value;
                  if (nextProvider !== "openai" && nextProvider !== "openrouter") return;
                  setProvider(nextProvider);
                  setModelName(models[nextProvider]);
                  setApiKey("");
                }}
                className="field-input"
              >
                <option value="openrouter">OpenRouter (DeepSeek)</option>
                <option value="openai">OpenAI</option>
              </select>
            </label>
            <label className="field-label sm:col-span-2">
              Chave da API {provider === "openrouter" ? "OpenRouter" : "OpenAI"}
              <input
                type="password"
                autoComplete="new-password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="field-input"
                placeholder={
                  providerConfigured
                    ? "Já configurada · deixe em branco para manter"
                    : provider === "openrouter"
                      ? "sk-or-v1-..."
                      : "sk-..."
                }
              />
            </label>
            <label className="field-label sm:col-span-2">
              Modelo
              <input
                required
                maxLength={100}
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="field-input"
                placeholder={models[provider]}
              />
            </label>
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-4 rounded-lg bg-[#edf7f4] px-3 py-2 text-sm text-brand">
            {notice}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={hide} className="button-secondary">
            Fechar
          </button>
          <button disabled={saving} className="button-primary">
            {saving ? "Salvando..." : "Salvar configurações"}
          </button>
        </div>
      </form>
    </div>
  );
}
