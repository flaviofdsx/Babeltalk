import { contextBridge, ipcRenderer } from "electron";
import type { BabelTalkApi } from "./shared";

const api: BabelTalkApi = {
  contacts: {
    list: () => ipcRenderer.invoke("contacts:list"),
    create: (input) => ipcRenderer.invoke("contacts:create", input),
    update: (input) => ipcRenderer.invoke("contacts:update", input),
    delete: (id) => ipcRenderer.invoke("contacts:delete", id)
  },
  messages: {
    list: (contactId) => ipcRenderer.invoke("messages:list", contactId),
    create: (input) => ipcRenderer.invoke("messages:create", input)
  },
  profile: {
    get: () => ipcRenderer.invoke("profile:get"),
    save: (profile) => ipcRenderer.invoke("profile:save", profile)
  },
  llm: {
    settings: () => ipcRenderer.invoke("llm:settings:get"),
    saveSettings: (settings) => ipcRenderer.invoke("llm:settings:save", settings),
    suggest: (input) => ipcRenderer.invoke("llm:suggest", input)
  }
};

contextBridge.exposeInMainWorld("babelTalk", api);
