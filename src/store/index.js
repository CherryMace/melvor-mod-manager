import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

import api from '@/api';
import { sortModsByLoadOrder } from '@/util';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    dir: '',
    packageDir: '',
    isValidDir: false,
    checkForUpdates: true,
    launchMode: 'steam',
    closeOnLaunch: true,
    gameVersion: '0.21',
    browserMods: [],
    mods: [],
    modLoadOrder: [],
    disabledMods: [],
    selectedMod: null,
    modBeingUpdated: null,
    isLoadingMods: false
  },
  getters: {
    selectedMod ({ mods, selectedMod }) {
      if (!selectedMod) return null;
      return mods.find(mod => mod.id === selectedMod);
    },
    selectedModIndex ({ mods, selectedMod }) {
      return mods.map(mod => mod.id).indexOf(selectedMod);
    },
    installedBrowserMod ({ mods }) {
      return (browserId) => mods.find(mod => mod.origin === 'browser' && mod.browserId === browserId);
    }
  },
  mutations: {
    setDir (state, dir) {
      state.dir = dir;
    },
    setPackageDir (state, packageDir) {
      state.packageDir = packageDir;
    },
    setDirValidity (state, isValid) {
      state.isValidDir = isValid;
    },
    setGameVersion (state, version) {
      state.gameVersion = version;
    },
    setBrowserMods (state, mods) {
      state.browserMods = mods;
    },
    setModLoadOrder (state, loadOrder) {
      state.modLoadOrder = loadOrder;
    },
    setDisabledMods (state, mods) {
      state.disabledMods = mods;
    },
    setMods (state, mods) {
      state.mods = mods;
    },
    setMod (state, mod) {
      state.mods = state.mods.map(m => m.id === mod.id ? mod : m);
    },
    selectMod (state, id) {
      state.selectedMod = id;
    },
    beginUpdateMod (state, id) {
      state.modBeingUpdated = id;
    },
    endUpdateMod (state) {
      state.modBeingUpdated = null;
    },
    setLoadModsState (state, isLoading) {
      state.isLoadingMods = isLoading;
    },
    setSetting (state, { key, value }) {
      state[key] = value;
    }
  },
  actions: {
    async loadSavedState ({ commit, dispatch }) {
      const checkForUpdates = localStorage.getItem('checkForUpdates');
      if (checkForUpdates !== null) commit('setSetting', { key: 'checkForUpdates', value: checkForUpdates === "true" });

      const launchMode = localStorage.getItem('launchMode');
      if (launchMode) commit('setSetting', { key: 'launchMode', value: launchMode });

      const closeOnLaunch = localStorage.getItem('closeOnLaunch');
      if (closeOnLaunch !== null) commit('setSetting', { key: 'closeOnLaunch', value: closeOnLaunch === "true" });

      const disabledMods = localStorage.getItem('disabledMods');
      if (disabledMods) commit('setDisabledMods', JSON.parse(disabledMods));

      const loadOrder = localStorage.getItem('modLoadOrder');
      if (loadOrder) dispatch('loadModLoadOrder', JSON.parse(loadOrder));

      await dispatch('loadGameMetadata');
      await dispatch('loadBrowser');

      const dir = localStorage.getItem('melvorDir');
      if (dir) await dispatch('setDir', dir);
    },
    async setDir ({ commit, dispatch }, dir) {
      const isValidDir = await api.file.validateMelvorDir(dir);
      if (!isValidDir) dir = 'Invalid Directory';
      commit('setDir', dir);
      let packageDir = dir;
      const platform = await api.process.getPlatform();
      if (platform === 'darwin') {
        packageDir = `${dir}/Melvor Idle.app/Contents/Resources/app.nw`;
      }
      commit('setDirValidity', isValidDir);
      commit('setPackageDir', packageDir);
      if (isValidDir) {
        localStorage.setItem('packageDir', packageDir);
        localStorage.setItem('melvorDir', dir);
        await dispatch('loadMods');
      } else {
        await dispatch('setMods', []);
      }
    },
    async loadGameMetadata({ commit }) {
      const res = await axios.get('https://cherrymace.github.io/m3-mod-browser/game.json');
      commit('setGameVersion', res.data.version);
    },
    async loadBrowser ({ commit }) {
      const res = await axios.get('https://cherrymace.github.io/m3-mod-browser/mods/all.json', {
        params: { t: new Date().getTime() }
      });
      commit('setBrowserMods', res.data);
    },
    loadModLoadOrder ({ commit }, modLoadOrder) {
      commit('setModLoadOrder', modLoadOrder);
    },
    saveModLoadOrder({ state, commit }) {
      const loadOrder = state.mods.map(mod => mod.id);
      commit('setModLoadOrder', loadOrder);
      localStorage.setItem('modLoadOrder', JSON.stringify(loadOrder));
    },
    async setMods ({ state, commit, dispatch }, mods) {
      commit('setMods', mods);
      if (!mods.length) return;
      dispatch('saveModLoadOrder');
      await api.mods.inject(state.packageDir, mods);
    },
    async loadMods ({ state, commit, dispatch }) {
      commit('setLoadModsState', true);
      const mods = await api.mods.loadAll(state.packageDir);
      commit('setLoadModsState', false);
      const modsWithDisabledFlag = mods.map(mod => ({ ...mod, disabled: state.disabledMods.includes(mod.id) }));
      const modsOrderedByLoadOrder = sortModsByLoadOrder(modsWithDisabledFlag, state.modLoadOrder);
      await dispatch('setMods', modsOrderedByLoadOrder);

      if (state.checkForUpdates) {
        for (const mod of modsOrderedByLoadOrder) {
          await dispatch('checkForUpdates', mod);
        }
      }
    },
    async loadMod ({ state, commit, dispatch }, id) {
      commit('setLoadModsState', true);
      const modToLoad = await api.mods.load(state.packageDir, id);
      commit('setLoadModsState', false);
      if (!modToLoad) return;

      modToLoad.disabled = state.disabledMods.includes(id);

      let mods = [];
      const alreadyLoaded = state.mods.find(mod => mod.id === modToLoad.id);
      if (alreadyLoaded) {
        mods = state.mods.map(mod => mod.id === modToLoad.id ? modToLoad : mod);
      } else {
        mods = [ ...state.mods, modToLoad ];
        mods = sortModsByLoadOrder(mods, state.modLoadOrder);
      }
      await dispatch('setMods', mods);
      if (state.checkForUpdates) {
        await dispatch('checkForUpdates', modToLoad);
      }
    },
    async setModDisabledState ({ state, dispatch }, { id, disabled }) {
      const mods = state.mods.map(mod => mod.id === id ? { ...mod, disabled } : mod);
      await dispatch('setMods', mods);
      dispatch('saveDisabledMods');
    },
    saveDisabledMods ({ state, commit }) {
      const disabledMods = state.mods.filter(mod => mod.disabled).map(mod => mod.id);
      commit('setDisabledMods', disabledMods);
      localStorage.setItem('disabledMods', JSON.stringify(disabledMods));
    },
    async addMod({ dispatch }, filePath) {
      const { id } = await api.mods.add(filePath);
      if (!id) return;
      await dispatch('loadMod', id);
    },
    selectMod ({ commit }, id) {
      commit('selectMod', id);
    },
    async checkForUpdates ({ state, commit }, mod) {
      let updateAvailable = null;

      if (mod.origin === 'browser') {
        const browserMod = state.browserMods.find(m => m.id === mod.browserId);
        if (!browserMod) return; // Mod has been removed from Discover
        if (browserMod.version !== mod.version)
          updateAvailable = browserMod.version;
      }
      else updateAvailable = await api.mods.checkForUpdates(mod);
      if (updateAvailable) commit('setMod', { ...mod, updateAvailable });
    },
    async updateAllMods ({ state, dispatch }) {
      for (const mod of state.mods) {
        if (mod.updateAvailable) await dispatch('updateMod', mod.id);
      }
    },
    async updateMod ({ state, dispatch, commit }, id) {
      commit('beginUpdateMod', id);
      const mod = state.mods.find(m => m.id === id);
      const browserData = mod.origin === 'browser' ? state.browserMods.find(m => m.id === mod.browserId) : null;
      await api.mods.update(state.packageDir, id, browserData);
      await dispatch('loadMod', id);
      commit('endUpdateMod');
    },
    async removeMod ({ state, dispatch }, id) {
      await api.mods.remove(state.packageDir, id);
      const mods = state.mods.filter(mod => mod.id !== id);
      await dispatch('setMods', mods);
    },
    async moveModLoadOrder ({ state, dispatch }, { id, moveUp }) {
      const index = state.mods.map(mod => mod.id).indexOf(id);
      if (index === -1) return;
      const moveToIndex = moveUp ? (index - 1) : (index + 1);
      if (moveToIndex < 0 || moveToIndex > state.mods.length - 1) return;

      const mods = [ ...state.mods ];
      const modToMove = mods[index];
      mods[index] = mods[moveToIndex];
      mods[moveToIndex] = modToMove;
      await dispatch('setMods', mods);
    },
    changeSetting ({ commit }, { key, value }) {
      localStorage.setItem(key, value);
      commit('setSetting', { key, value });
    }
  }
})
