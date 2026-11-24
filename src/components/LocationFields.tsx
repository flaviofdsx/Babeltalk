import { countries, getCountry, getLanguage } from "../data/locations";

export interface LocationValue {
  country: string;
  state: string;
  city: string;
  language: string;
}

interface LocationFieldsProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}

export function LocationFields({ value, onChange }: LocationFieldsProps) {
  const regions = getCountry(value.country)?.regions ?? [];

  function changeCountry(country: string) {
    onChange({
      ...value,
      country,
      state: "",
      language: getLanguage(country)
    });
  }

  return (
    <>
      <label className="field-label">
        País
        <select required value={value.country} onChange={(event) => changeCountry(event.target.value)} className="field-input">
          {!countries.some((option) => option.country === value.country) && value.country && (
            <option value={value.country}>{value.country}</option>
          )}
          {countries.map((option) => <option key={option.country} value={option.country}>{option.country}</option>)}
        </select>
      </label>
      <label className="field-label">
        Estado / província
        <select
          value={value.state}
          disabled={!regions.length}
          onChange={(event) => onChange({ ...value, state: event.target.value })}
          className="field-input disabled:bg-canvas disabled:text-muted"
        >
          <option value="">{regions.length ? "Selecione uma região" : "Não se aplica"}</option>
          {value.state && !regions.includes(value.state) && <option value={value.state}>{value.state}</option>}
          {regions.map((region) => <option key={region} value={region}>{region}</option>)}
        </select>
      </label>
      <label className="field-label">
        Cidade
        <input
          maxLength={100}
          value={value.city}
          onChange={(event) => onChange({ ...value, city: event.target.value })}
          className="field-input"
          placeholder="Ex.: São Paulo"
        />
      </label>
      <label className="field-label">
        Idioma principal
        <input
          readOnly
          value={value.language}
          className="field-input bg-canvas text-muted"
          aria-describedby="language-auto-help"
        />
        <span id="language-auto-help" className="sr-only">Idioma preenchido automaticamente de acordo com o país.</span>
      </label>
    </>
  );
}
