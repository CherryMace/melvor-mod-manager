import { process, file, mods } from './messageTypes';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('process', {
  launchMelvor: async (melvorDir, launchMode) => await ipcRenderer.invoke('process', { type: process.launchMelvor, melvorDir, launchMode }),
  openLink: async (url) => await ipcRenderer.invoke('process', { type: process.openLink, url }),
  minimize: () => ipcRenderer.invoke('process', { type: process.minimize }),
  maximize: () => ipcRenderer.invoke('process', { type: process.maximize }),
  exit: () => ipcRenderer.invoke('process', { type: process.exit }),
  getPlatform: () => ipcRenderer.invoke('process', { type: process.getPlatform }),
  getVersion: () => ipcRenderer.invoke('process', { type: process.getVersion })
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
  // Returns mod manifest
  browserInstall: async (packageDir, data) => await ipcRenderer.invoke('mods', { type: mods.browserInstall, packageDir, data }),
  // Returns error
  add: async (packageDir, origin, manifest, content) => await ipcRenderer.invoke('mods', { type: mods.add, packageDir, origin, manifest, content }),
  // Returns array of mod manifests
  loadAll: async (packageDir) => await ipcRenderer.invoke('mods', { type: mods.loadAll, packageDir }),
  // Returns mod manifest
  load: async (packageDir, id) => await ipcRenderer.invoke('mods', { type: mods.load, packageDir, id }),
  // Returns latest mod version or null if unable to fetch
  checkForUpdates: async (mod) => await ipcRenderer.invoke('mods', { type: mods.checkForUpdates, mod }),
  // Returns error
  update: async (packageDir, id, browserData) => await ipcRenderer.invoke('mods', { type: mods.update, packageDir, id, browserData }),
  // Returns error
  remove: async (packageDir, id) => await ipcRenderer.invoke('mods', { type: mods.remove, packageDir, id }),
  // Returns error
  inject: async (packageDir, modsToInject) => await ipcRenderer.invoke('mods', { type: mods.inject, packageDir, mods: modsToInject })
});
