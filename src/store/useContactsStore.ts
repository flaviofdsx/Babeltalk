import { create } from "zustand";
import type { Contact, ContactInput } from "../types";

interface ContactsState {
  contacts: Contact[];
  selectedContactId: string | null;
  loading: boolean;
  load: () => Promise<void>;
  select: (id: string | null) => void;
  add: (input: ContactInput) => Promise<Contact>;
  update: (contact: Contact & ContactInput) => Promise<Contact>;
  remove: (id: string) => Promise<void>;
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  selectedContactId: null,
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const contacts = await window.babelTalk.contacts.list();
      const selectedContactId = contacts.some((contact) => contact.id === get().selectedContactId)
        ? get().selectedContactId
        : (contacts[0]?.id ?? null);
      set({ contacts, selectedContactId });
    } finally {
      set({ loading: false });
    }
  },
  select: (selectedContactId) => set({ selectedContactId }),
  add: async (input) => {
    const contact = await window.babelTalk.contacts.create(input);
    set((state) => ({
      contacts: [contact, ...state.contacts],
      selectedContactId: contact.id
    }));
    return contact;
  },
  update: async (input) => {
    const contact = await window.babelTalk.contacts.update(input);
    set((state) => ({
      contacts: state.contacts.map((item) => (item.id === contact.id ? contact : item))
    }));
    return contact;
  },
  remove: async (id) => {
    await window.babelTalk.contacts.delete(id);
    set((state) => {
      const contacts = state.contacts.filter((contact) => contact.id !== id);
      return {
        contacts,
        selectedContactId:
          state.selectedContactId === id ? (contacts[0]?.id ?? null) : state.selectedContactId
      };
    });
  }
}));
