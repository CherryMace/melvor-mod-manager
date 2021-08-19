import { BrowserWindow } from 'electron';

import open from 'open';

import messageTypes from './messageTypes';

export default async (_event, message) => {
  return await handlers[message.type](message);
};

const handlers = {
  [messageTypes.process.launchMelvor]: async () => {
    const appId = 1267910;
    console.log('Here!');
    open(`steam://run/${appId}`);
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