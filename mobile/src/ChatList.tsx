import React, { useState } from "react";
import type { Contact } from "../../shared/types";

interface ChatListProps {
  onSelectContact?: (contact: Contact) => void;
}

const MOCK_CONTACTS: Contact[] = [];

export function ChatList({ onSelectContact }: ChatListProps) {
  const [contacts] = useState(MOCK_CONTACTS);

  return <></>;
}

void onSelectContact;
void contacts;
