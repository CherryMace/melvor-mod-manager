import { dialog } from 'electron';
import { access, readFile } from 'fs/promises';
import path from 'path';

import usp from 'userscript-parser';

import { file } from './messageTypes';

export default async (_event, message) => {
  return await handlers[message.type](message);
};

const handlers = {
  [file.openScript]: async () => {
    // Open .js or .json and parse manifest
    const res = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Userscript or extension manifest', extensions: ['js', 'json'] }
      ]
    });

    return res.canceled ? null : res.filePaths[0];
  },

  [file.openDir]: async () => {
    // Prompt directory and return path
    const res = await dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] });
    const dir = res.canceled ? null : res.filePaths[0];
    return dir;
  },

  [file.validateMelvorDir]: async ({ dir }) => {
    // Validate that Melvor Idle.exe exists in dir
    const melvorPath = path.join(dir, 'Melvor Idle.exe');
    try {
      await access(melvorPath);
      return true;
    } catch {
      return false;
    }
  }
};