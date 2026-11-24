import { app, Tray, Menu, nativeImage, BrowserWindow } from "electron";
import { getPendingOutboxCount } from "../worker/outbox";
import type Database from "better-sqlite3";

let tray: Tray | null = null;
let trayInterval: ReturnType<typeof setInterval> | null = null;

export function createTray(db: Database.Database): Tray {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);

  function buildMenu(): Menu {
    const pending = getPendingOutboxCount(db);
    const label =
      pending > 0 ? `📨 ${pending} mensagens pendentes` : "📬 Todas as mensagens enviadas";

    return Menu.buildFromTemplate([
      {
        label: "BabelTalk",
        enabled: false
      },
      { type: "separator" },
      {
        label,
        enabled: false
      },
      { type: "separator" },
      {
        label: "Abrir BabelTalk",
        click: () => {
          const wins = BrowserWindow.getAllWindows();
          if (wins.length > 0) {
            const win = wins[0];
            win.show();
            win.focus();
          }
        }
      },
      {
        label: "Sair",
        click: () => {
          destroyTray();
          app.quit();
        }
      }
    ]);
  }

  tray.setToolTip("BabelTalk");
  tray.setContextMenu(buildMenu());

  trayInterval = setInterval(() => {
    if (tray && !tray.isDestroyed()) {
      tray.setContextMenu(buildMenu());
    }
  }, 30_000);

  return tray;
}

export function destroyTray(): void {
  if (trayInterval) {
    clearInterval(trayInterval);
    trayInterval = null;
  }
  if (tray && !tray.isDestroyed()) {
    tray.destroy();
  }
  tray = null;
}
