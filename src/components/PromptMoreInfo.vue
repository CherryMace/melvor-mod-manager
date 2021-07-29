<template>
  <v-card color="blue-grey darken-1">
    <v-card-title>Add Mod</v-card-title>
    <v-card-text>
      <v-container fluid>
        <div>Provide a name for this mod:</div>
        <v-row class="mb-1" no-gutters>
          <v-col cols="12">
            <v-text-field v-model="name" label="Name" ref="nameTextField" solo-inverted flat dense single-line hide-details @keydown.enter="confirm"></v-text-field>
          </v-col>
        </v-row>
        <div v-show="error" class="red--text">{{ error }}</div>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn @click="closeDialog" depressed plain>Cancel</v-btn>
      <v-btn @click="confirm" color="primary" depressed :disabled="!name" :loading="loading">Add</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mods } from '@/api';

export default {
  props: ['data', 'isOpen', 'close'],
  data () {
    return {
      name: '',
      loading: false,
      error: ''
    };
  },
  methods: {
    async confirm () {
      if (!this.name) return;

      this.loading = true;
      const mod = await mods.add(this.$store.state.dir, this.data.origin, { ...this.data.manifest, name: this.name }, this.data.content);
      if (mod.error) {
        this.error = mod.error;
        this.loading = false;
        return;
      }
      await this.$store.dispatch('loadMod', mod.id);
      this.closeDialog();
    },
    resetDialog () {
      this.name = '';
      this.loading = false;
      this.error = '';
    },
    closeDialog () {
      this.resetDialog();
      this.close();
    }
  },
  created () {
    if (this.isOpen) setTimeout(() => this.$refs.nameTextField.focus());
  },
  watch: {
    isOpen (val) {
      if (val) setTimeout(() => this.$refs.nameTextField.focus());
      else {
        this.resetDialog();
      }
    }
  }
}
</script>
