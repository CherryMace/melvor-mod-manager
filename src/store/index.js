import Vue from 'vue'
import Vuex from 'vuex'

import api from '@/api';
import { sortModsByLoadOrder } from '@/util';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    dir: '',
    isValidDir: false,
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
    }
  },
  mutations: {
    setDir (state, dir) {
      state.dir = dir;
    },
    setDirValidity (state, isValid) {
      state.isValidDir = isValid;
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
    }
  },
  actions: {
    async loadSavedState ({ commit, dispatch }) {
      const disabledMods = localStorage.getItem('disabledMods');
      if (disabledMods) commit('setDisabledMods', JSON.parse(disabledMods));

      const loadOrder = localStorage.getItem('modLoadOrder');
      if (loadOrder) dispatch('loadModLoadOrder', JSON.parse(loadOrder));

      const dir = localStorage.getItem('melvorDir');
      if (dir) await dispatch('setDir', dir);
    },
    async setDir ({ commit, dispatch }, dir) {
      const isValidDir = await api.file.validateMelvorDir(dir);
      if (!isValidDir) dir = 'Invalid Directory';
      commit('setDir', dir);
      commit('setDirValidity', isValidDir);
      if (isValidDir) {
        localStorage.setItem('melvorDir', dir);
        await dispatch('loadMods');
      } else {
        await dispatch('setMods', []);
      }
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
      await api.mods.inject(state.dir, mods);
    },
    async loadMods ({ state, commit, dispatch }, checkForUpdates = true) {
      commit('setLoadModsState', true);
      const mods = await api.mods.loadAll(state.dir, checkForUpdates);
      commit('setLoadModsState', false);
      const modsWithDisabledFlag = mods.map(mod => ({ ...mod, disabled: state.disabledMods.includes(mod.id) }));
      const modsOrderedByLoadOrder = sortModsByLoadOrder(modsWithDisabledFlag, state.modLoadOrder);
      await dispatch('setMods', modsOrderedByLoadOrder);
    },
    async loadMod ({ state, commit, dispatch }, id) {
      commit('setLoadModsState', true);
      const modToLoad = await api.mods.load(state.dir, id);
      commit('setLoadModsState', false);
      if (!modToLoad) return;
      modToLoad.disabled = state.disabledMods.includes(id);
      const alreadyLoaded = state.mods.find(mod => mod.id === modToLoad.id);

      let mods = [];
      if (alreadyLoaded) {
        mods = state.mods.map(mod => mod.id === modToLoad.id ? modToLoad : mod);
      } else {
        mods = [ ...state.mods, modToLoad ];
        mods = sortModsByLoadOrder(mods, state.modLoadOrder);
      }
      await dispatch('setMods', mods);
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
    async updateAllMods ({ state, dispatch }) {
      for (const mod of state.mods) {
        if (mod.updateAvailable) await dispatch('updateMod', mod.id);
      }
    },
    async updateMod ({ state, dispatch, commit }, id) {
      commit('beginUpdateMod', id);
      await api.mods.update(state.dir, id);
      await dispatch('loadMod', id);
      commit('endUpdateMod');
    },
    async removeMod ({ state, dispatch }, id) {
      await api.mods.remove(state.dir, id);
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
    }
  }
})
