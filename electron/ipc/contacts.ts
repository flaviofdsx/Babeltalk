import { ipcMain } from "electron";
import {
  createContact,
  deleteContact,
  getProfile,
  listContacts,
  saveProfile,
  updateContact,
  type Contact,
  type Profile
} from "../db";

function requiredText(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    throw new Error(`${label} é obrigatório e deve ter até ${maxLength} caracteres.`);
  }
  return value.trim();
}

function optionalText(value: unknown, label: string, maxLength = 100): string {
  if (typeof value !== "string" || value.length > maxLength) {
    throw new Error(`${label} deve ter até ${maxLength} caracteres.`);
  }
  return value.trim();
}

function validateContact(input: Partial<Contact>) {
  return {
    name: requiredText(input.name, "Nome", 80),
    country: requiredText(input.country, "País", 80),
    state: optionalText(input.state, "Estado"),
    city: optionalText(input.city, "Cidade"),
    language: requiredText(input.language, "Idioma", 80),
    observations: optionalText(input.observations, "Observações", 1000)
  };
}

function validateProfile(input: Partial<Profile>): Profile {
  if (typeof input.applyRegionalisms !== "boolean") {
    throw new Error("Informe se deseja aplicar regionalismos.");
  }
  return {
    name: requiredText(input.name, "Seu nome", 80),
    country: requiredText(input.country, "País", 80),
    state: optionalText(input.state, "Estado"),
    city: optionalText(input.city, "Cidade"),
    language: requiredText(input.language, "Idioma", 80),
    observations: optionalText(input.observations, "Observações", 1000),
    applyRegionalisms: input.applyRegionalisms
  };
}

export function registerContactHandlers(): void {
  ipcMain.handle("contacts:list", () => listContacts());
  ipcMain.handle("contacts:create", (_event, input: Partial<Contact>) =>
    createContact(validateContact(input))
  );
  ipcMain.handle("contacts:update", (_event, input: Partial<Contact>) => {
    if (typeof input.id !== "string" || !input.id) throw new Error("ID de contato inválido.");
    return updateContact({ ...validateContact(input), id: input.id } as Contact);
  });
  ipcMain.handle("contacts:delete", (_event, id: unknown) => {
    if (typeof id !== "string" || !id) throw new Error("ID de contato inválido.");
    deleteContact(id);
  });
  ipcMain.handle("profile:get", () => getProfile());
  ipcMain.handle("profile:save", (_event, input: Partial<Profile>) =>
    saveProfile(validateProfile(input))
  );
}
