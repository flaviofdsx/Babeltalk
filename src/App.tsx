import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { SettingsModal } from "./components/SettingsModal";
import { ChatPage } from "./pages/ChatPage";
import { ContactsPage } from "./pages/ContactsPage";
import { useContactsStore } from "./store/useContactsStore";
import { useSettingsStore } from "./store/useSettingsStore";

type Page = "chats" | "contacts";

export default function App() {
  const [page, setPage] = useState<Page>("chats");
  const [startupError, setStartupError] = useState("");
  const loadContacts = useContactsStore((state) => state.load);
  const loadSettings = useSettingsStore((state) => state.load);

  useEffect(() => {
    void Promise.all([loadContacts(), loadSettings()]).catch((reason: unknown) => {
      setStartupError(reason instanceof Error ? reason.message : "Não foi possível iniciar o BabelTalk.");
    });
  }, [loadContacts, loadSettings]);

  return (
    <div className="flex h-screen min-h-[600px] min-w-[850px] overflow-hidden bg-canvas text-ink">
      <Sidebar page={page} onNavigate={setPage} />
      {page === "chats" ? <ChatPage /> : <ContactsPage onOpenChat={() => setPage("chats")} />}
      <SettingsModal />
      {startupError && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-xl border border-red-100 bg-white px-4 py-3 text-sm text-red-700 shadow-panel" role="alert">
          <strong>Falha ao iniciar:</strong> {startupError}
          <button onClick={() => setStartupError("")} className="ml-3 font-semibold" aria-label="Fechar erro">×</button>
        </div>
      )}
    </div>
  );
}
