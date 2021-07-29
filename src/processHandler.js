import path from 'path';
import cp from 'child_process';
import { BrowserWindow } from 'electron';

import messageTypes from './messageTypes';

export default async (_event, message) => {
  return await handlers[message.type](message);
};

const handlers = {
  [messageTypes.process.launchMelvor]: async ({ melvorDir }) => {
    const exePath = path.join(melvorDir, 'Melvor Idle.exe');

    const subprocess = cp.spawn(exePath, {
      detached: true,
      stdio: 'ignore'
    });
    
    subprocess.unref();
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