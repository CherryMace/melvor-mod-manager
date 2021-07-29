<template>
  <v-card loading color="blue-grey darken-3">
    <v-card-title>Add From File</v-card-title>
    <v-card-text>
      <v-container fluid>
        <v-row class="mb-1" no-gutters>
          <v-col cols="9">
            <v-text-field solo-inverted tile flat dense disabled single-line v-model="fileName" hide-details></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-btn @click="promptFile" depressed tile block color="primary" height="38" :disabled="fileDialogOpen" :loading="loading">Browse</v-btn>
          </v-col>
        </v-row>
        <div v-show="error" class="red--text">{{ error }}</div>
        <div>Accepted types are script (.js) files and WebExtension extension manifests (manifest.json).</div>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn @click="closeDialog" depressed plain :disabled="fileDialogOpen">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { file, mods } from '@/api';

export default {
  props: ['promptMoreInfo', 'isOpen', 'close'],
  data () {
    return {
      file: null,
      fileDialogOpen: false,
      loading: false,
      error: ''
    };
  },
  computed: {
    fileName () {
      if (!this.file) return null;

      const path = this.file.split('\\');

      return path[path.length - 1];
    }
  },
  methods: {
    async promptFile () {
      this.fileDialogOpen = true;
      this.file = await file.openScript();
      this.fileDialogOpen = false;
      this.error = '';
      if (!this.file) return;
      this.loading = true;
      const manifest = await mods.parseFile(this.file);
      if (manifest.error) {
        this.error = manifest.error;
        this.loading = false;
        return;
      }
      if (manifest.name) {
        const mod = await mods.add(this.$store.state.dir, this.file, manifest);
        if (mod.error) {
          this.error = mod.error;
          this.loading = false;
          return;
        }
        await this.$store.dispatch('loadMod', mod.id);
      } else {
        this.promptMoreInfo(manifest, this.file);
      }
      this.closeDialog();
    },
    resetDialog () {
      this.file = null;
      this.fileDialogOpen = false;
      this.loading = false;
      this.error = '';
    },
    closeDialog () {
      this.resetDialog();
      this.close();
    }
  },
  watch: {
    isOpen (val) {
      if (!val) this.resetDialog();
    }
  }
}
</script>

<style lang="scss" scoped>
.v-text-field {
  border-radius: 0;
}
</style>