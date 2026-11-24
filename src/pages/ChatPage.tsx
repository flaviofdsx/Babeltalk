import { useState } from "react";
import { ChatWindow } from "../components/ChatWindow";
import { ContactForm } from "../components/ContactForm";
import { ContactList } from "../components/ContactList";
import { useContactsStore } from "../store/useContactsStore";
import type { ContactInput } from "../types";

export function ChatPage() {
  const [adding, setAdding] = useState(false);
  const contacts = useContactsStore((state) => state.contacts);
  const selectedContactId = useContactsStore((state) => state.selectedContactId);
  const add = useContactsStore((state) => state.add);
  const selected = contacts.find((contact) => contact.id === selectedContactId) ?? null;

  async function createContact(input: ContactInput) {
    await add(input);
  }

  return (
    <>
      <ContactList onAdd={() => setAdding(true)} />
      <ChatWindow contact={selected} />
      {adding && <ContactForm onClose={() => setAdding(false)} onSave={createContact} />}
    </>
  );
}
