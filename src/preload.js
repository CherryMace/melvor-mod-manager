import { process, file, mods } from './messageTypes';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('process', {
  launchMelvor: (melvorDir) => ipcRenderer.invoke('process', { type: process.launchMelvor, melvorDir }),
  minimize: () => ipcRenderer.invoke('process', { type: process.minimize }),
  maximize: () => ipcRenderer.invoke('process', { type: process.maximize }),
  exit: () => ipcRenderer.invoke('process', { type: process.exit })
});

contextBridge.exposeInMainWorld('file', {
  // Returns generated manifest (for validation/renaming) and path
  openScript: async () => await ipcRenderer.invoke('file', { type: file.openScript }),
  // Returns path to opened directory
  openDir: async () => await ipcRenderer.invoke('file', { type: file.openDir }),
  // Returns true/false based on if Melvor is detected at path
  validateMelvorDir: async (dir) => await ipcRenderer.invoke('file', { type: file.validateMelvorDir, dir })
});

contextBridge.exposeInMainWorld('mods', {
  // Returns mod manifest
  parseFile: async (filePath) => await ipcRenderer.invoke('mods', { type: mods.parseFile, filePath }),
  // Returns mod manifest
  parseWeb: async (url) => await ipcRenderer.invoke('mods', { type: mods.parseWeb, origin: url }),
  // Returns error
  add: async (melvorDir, origin, manifest, content) => await ipcRenderer.invoke('mods', { type: mods.add, melvorDir, origin, manifest, content }),
  // Returns array of mod manifests
  loadAll: async (melvorDir) => await ipcRenderer.invoke('mods', { type: mods.loadAll, melvorDir }),
  // Returns mod manifest
  load: async (melvorDir, id) => await ipcRenderer.invoke('mods', { type: mods.load, melvorDir, id }),
  // Returns latest mod version or null if unable to fetch
  checkForUpdates: async (mod) => await ipcRenderer.invoke('mods', { type: mods.checkForUpdates, mod }),
  // Returns error
  update: async (melvorDir, id) => await ipcRenderer.invoke('mods', { type: mods.update, melvorDir, id }),
  // Returns error
  remove: async (melvorDir, id) => await ipcRenderer.invoke('mods', { type: mods.remove, melvorDir, id }),
  // Returns error
  inject: async (melvorDir, modsToInject) => await ipcRenderer.invoke('mods', { type: mods.inject, melvorDir, mods: modsToInject })
});
