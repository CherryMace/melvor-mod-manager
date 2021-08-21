import cp from 'child_process';
import path from 'path';
import { BrowserWindow } from 'electron';

import open from 'open';

import messageTypes from './messageTypes';

export default async (_event, message) => {
  return await handlers[message.type](message);
};

const handlers = {
  [messageTypes.process.launchMelvor]: async ({ melvorDir, launchMode }) => {
    if (launchMode === 'exe') {
      const exePath = path.join(melvorDir, 'Melvor Idle.exe');

      const subprocess = cp.spawn(exePath, {
        detached: true,
        stdio: 'ignore'
      });
  
      subprocess.unref();
      return;
    }
    
    const appId = 1267910;
    await open(`steam://run/${appId}`, { wait: true });
  },
  [messageTypes.process.minimize]: async () => {
    BrowserWindow.getFocusedWindow().minimize();
  },
  [messageTypes.process.maximize]: async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  },
  [messageTypes.process.exit]: async () => {
    process.exit();
  }
};