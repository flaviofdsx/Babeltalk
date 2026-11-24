import { app, BrowserWindow } from "electron";
import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { closeDatabase, getDatabase, initializeDatabase } from "./db";
import { registerIpcHandlers } from "./ipc";
import { createTransport } from "./transport/serverless";
import { OutboxScheduler } from "./worker/scheduler";
import { createTray, destroyTray } from "./tray";

let mainWindow: BrowserWindow | undefined;
let outboxScheduler: OutboxScheduler | undefined;

function loadDevelopmentEnv(): void {
  if (app.isPackaged || process.env.NODE_ENV !== "development") return;

  const envPath = join(app.getAppPath(), ".env");
  if (existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      console.error("Não foi possível carregar o arquivo .env de desenvolvimento:", result.error);
    }
  }
}

loadDevelopmentEnv();

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 850,
    minHeight: 600,
    backgroundColor: "#f6f7f8",
    title: "BabelTalk",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    void mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    void mainWindow.loadFile(join(__dirname, "..", "dist", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = undefined;
  });
}

app
  .whenReady()
  .then(() => {
    initializeDatabase();
    const db = getDatabase();
    registerIpcHandlers();
    createWindow();

    const transport = createTransport();
    outboxScheduler = new OutboxScheduler({
      db,
      transport,
      onStatusChange: () => {}
    });
    outboxScheduler.start();

    createTray(db);

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  })
  .catch((error: unknown) => {
    console.error("Falha ao iniciar o BabelTalk:", error);
    app.quit();
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    destroyTray();
    app.quit();
  }
});

app.on("before-quit", () => {
  outboxScheduler?.stop();
  destroyTray();
  closeDatabase();
});
