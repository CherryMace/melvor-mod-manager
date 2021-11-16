import cp from 'child_process';
import path from 'path';
import { BrowserWindow, app } from 'electron';

import open from 'open';
import { getExecutableFilename } from './util'
import messageTypes from './messageTypes';

export default async (_event, message) => {
  return await handlers[message.type](message);
};

const handlers = {
  [messageTypes.process.launchMelvor]: async ({ melvorDir, launchMode }) => {
    if (launchMode === 'exe') {
      const exePath = path.join(melvorDir, getExecutableFilename(process.platform));

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

  [messageTypes.process.openLink]: ({ url }) => {
    open(url);
  },

  [messageTypes.process.minimize]: () => {
    BrowserWindow.getFocusedWindow().minimize();
  },

  [messageTypes.process.maximize]: () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  },

  [messageTypes.process.exit]: process.exit,

  [messageTypes.process.getPlatform]: () => process.platform,

  [messageTypes.process.getVersion]: () => app.getVersion()
};