<template>
  <section>
    <div class="d-flex">
      <v-menu offset-y right :value="addMenu">
        <template v-slot:activator="{ attrs, on }">
          <v-btn
            color="lime accent-4"
            v-bind="attrs"
            v-on="on"
            outlined
            depressed
            :disabled="disabled"
            @click="addMenu = true"
          >
            Add
            <v-icon small>add</v-icon>
          </v-btn>
        </template>

        <v-list dense color="#05090c">
          <v-dialog
            v-model="fileDialog" 
            :overlay="false"
            max-width="500px"
            transition="dialog-transition"
          >
            <template v-slot:activator="{ attrs, on }">
              <v-list-item link v-bind="attrs" v-on="on" >
                <v-list-item-title>
                  <v-icon small>insert_drive_file</v-icon>
                  From File
                </v-list-item-title>
              </v-list-item>
            </template>

            <add-from-file :close="closeFileDialog" :isOpen="fileDialog" :promptMoreInfo="promptMoreInfo" />
          </v-dialog>
          
          <v-dialog
            v-model="urlDialog" 
            :overlay="false"
            max-width="500px"
            transition="dialog-transition"
          >
            <template v-slot:activator="{ attrs, on }">
              <v-list-item link v-bind="attrs" v-on="on">
                <v-list-item-title>
                  <v-icon small>language</v-icon>
                  From URL
                </v-list-item-title>
              </v-list-item>
            </template>

            <add-from-url :close="closeUrlDialog" :isOpen="urlDialog" :promptMoreInfo="promptMoreInfo" />
          </v-dialog>
        </v-list>

        <v-dialog
          v-model="moreInfoDialog"
          :overlay="false"
          max-width="500px"
          transition="dialog-transition"
        >
          <prompt-more-info :data="moreInfoData" :close="closeMoreInfoDialog" :isOpen="moreInfoDialog" />
        </v-dialog>
      </v-menu>
      <v-btn tile plain :disabled="!canUpdateAll" @click="updateAll">Update All</v-btn>
      <v-btn tile plain :disabled="!canBeUpdated" @click="update">Update</v-btn>
      <v-btn tile plain :disabled="!canToggleDisabled" @click="toggleDisabled">{{ toggleDisabledText }}</v-btn>
      <v-btn tile plain :disabled="!canRemove" @click="remove">Remove</v-btn>
      <v-spacer />
      <span class="overline pt-1 text--secondary" style="user-select: none;">Load Order</span>
      <v-btn tile plain icon :disabled="!canMoveUp" @click="moveUp"><v-icon>keyboard_arrow_up</v-icon></v-btn>
      <v-btn tile plain icon :disabled="!canMoveDown" @click="moveDown"><v-icon>keyboard_arrow_down</v-icon></v-btn>
    </div>
  </section>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import AddFromFile from './AddFromFile.vue';
import AddFromUrl from './AddFromUrl.vue';
import PromptMoreInfo from './PromptMoreInfo.vue';

export default {
  components: { AddFromFile, AddFromUrl, PromptMoreInfo },
  props: ['disabled'],
  data () {
    return {
      addMenu: false,
      fileDialog: false,
      urlDialog: false,
      moreInfoDialog: false,
      moreInfoData: null,
      addedMod: null
    };
  },
  computed: {
    ...mapState(['mods', 'modBeingUpdated']),
    ...mapGetters(['selectedMod', 'selectedModIndex']),
    canBeUpdated () {
      return !this.disabled && !this.modBeingUpdated && !!this.selectedMod && this.selectedMod.updateAvailable;
    },
    canUpdateAll () {
      return !this.disabled && !this.modBeingUpdated && this.$store.state.mods.some(mod => mod.updateAvailable);
    },
    canToggleDisabled () {
      return !this.disabled && !!this.selectedMod;
    },
    canRemove () {
      return !this.disabled && !!this.selectedMod;
    },
    canMoveUp () {
      return !this.disabled && !!this.selectedMod && this.selectedModIndex > 0; 
    },
    canMoveDown () {
      return !this.disabled && !!this.selectedMod && this.selectedModIndex < this.mods.length - 1;
    },
    toggleDisabledText () {
      return (this.selectedMod && this.selectedMod.disabled) ? 'Enable' : 'Disable';
    }
  },
  methods: {
    closeFileDialog () {
      this.fileDialog = false;
    },
    closeUrlDialog () {
      this.urlDialog = false;
    },
    closeMoreInfoDialog () {
      this.moreInfoDialog = false;
    },
    promptMoreInfo (manifest, origin, content) {
      this.moreInfoData = { manifest, origin, content };
      this.moreInfoDialog = true;
    },
    async updateAll () {
      await this.$store.dispatch('updateAllMods');
    },
    async update () {
      await this.$store.dispatch('updateMod', this.selectedMod.id);
    },
    async toggleDisabled () {
      await this.$store.dispatch('setModDisabledState', { id: this.selectedMod.id, disabled: !this.selectedMod.disabled });
    },
    async remove () {
      await this.$store.dispatch('removeMod', this.selectedMod.id);
    },
    moveUp () {
      this.$store.dispatch('moveModLoadOrder', { id: this.selectedMod.id, moveUp: true });
    },
    moveDown () {
      this.$store.dispatch('moveModLoadOrder', { id: this.selectedMod.id });
    }
  },
  watch: {
    fileDialog (val) {
      if (val) this.addMenu = false;
    },
    urlDialog (val) {
      if (val) this.addMenu = false;
    }
  }
}
</script>
