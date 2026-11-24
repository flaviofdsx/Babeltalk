import { useContactsStore } from "../store/useContactsStore";
import { useSettingsStore } from "../store/useSettingsStore";

interface SidebarProps {
  page: "chats" | "contacts";
  onNavigate: (page: "chats" | "contacts") => void;
}

export function Sidebar({ page, onNavigate }: SidebarProps) {
  const contacts = useContactsStore((state) => state.contacts);
  const showSettings = useSettingsStore((state) => state.show);
  return (
    <aside className="flex w-[76px] shrink-0 flex-col items-center border-r border-line bg-white py-5">
      <div className="mb-9 grid h-11 w-11 place-items-center rounded-2xl bg-brand text-xl font-black text-white shadow-sm">
        b
      </div>
      <nav className="flex flex-col gap-3">
        <button
          aria-label="Conversas"
          title="Conversas"
          onClick={() => onNavigate("chats")}
          className={`side-icon ${page === "chats" ? "side-icon-active" : ""}`}
        >
          <span className="text-xl">◌</span>
          <span className="side-label">Conversas</span>
        </button>
        <button
          aria-label="Contatos"
          title="Contatos"
          onClick={() => onNavigate("contacts")}
          className={`side-icon ${page === "contacts" ? "side-icon-active" : ""}`}
        >
          <span className="text-lg">♙</span>
          <span className="side-label">Contatos</span>
        </button>
      </nav>
      <div className="mt-auto flex flex-col items-center gap-4">
        <div className="text-[11px] font-semibold text-muted">{contacts.length} contatos</div>
        <button
          aria-label="Configurações"
          title="Configurações"
          onClick={showSettings}
          className="side-icon"
        >
          <span className="text-lg">⚙</span>
          <span className="side-label">Configurações</span>
        </button>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-[#e6f2ee] text-sm font-bold text-brand">
          BT
        </div>
      </div>
    </aside>
  );
}
