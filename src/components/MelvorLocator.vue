<template>
  <div class="d-flex" style="width:100%">
    <div @dblclick="promptDirectory" class="flex-grow-1">
      <v-text-field class="squared-text-field ellipses" placeholder="Select your Melvor Idle installation directory..." flat solo tile dense disabled single-line v-model="dir" hide-details>
        <template v-slot:prepend-inner>
          <v-icon :color="display[result].color">{{ display[result].icon }}</v-icon>
        </template>
      </v-text-field>
    </div>
    <v-btn v-if="result !== 'success'" height="38" color="primary darken-2" class="squared-left-button" :disabled="openingDirectory" depressed @click="promptDirectory">
      <span class="d-none d-sm-inline">Browse</span>
      <v-icon right small>search</v-icon>
    </v-btn>
    <v-btn v-else height="38" color="primary" class="squared-left-button" :loading="launching" depressed @click="launchMelvor">
      <span class="d-none d-sm-inline">Launch</span>
      <v-icon right small>play_arrow</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import { file, mods, process } from '@/api';

export default {
  data () {
    return {
      openingDirectory: false,
      display: {
        'success': { icon: 'check_circle', color: '#4caf50' },
        'failure': { icon: 'cancel', color: '#ff5252' },
        'none': { icon: 'folder', color: 'inherit' }
      },
      launching: false
    }
  },
  computed: {
    ...mapState(['dir']),
    result () {
      const dir = this.$store.state.dir;
      if (!dir) return 'none';
      if (!this.$store.state.isValidDir) return 'failure';
      return 'success';
    }
  },
  methods: {
    async promptDirectory () {
      this.openingDirectory = true;
      const dir = await file.openDir();
      if (dir) await this.$store.dispatch('setDir', dir);
      this.openingDirectory = false;
    },
    async launchMelvor () {
      this.launching = true;
      try {
        await mods.inject(this.$store.state.packageDir, this.$store.state.mods);
        await process.launchMelvor(this.$store.state.dir, this.$store.state.launchMode);
        if (this.$store.state.closeOnLaunch) process.exit();
      } catch (e) {
        console.error(e);
      }
      this.launching = false;
    }
  }
};
</script>

<style lang="scss">
.squared-text-field {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;

  .v-input__slot {
    background-color: #05090c !important;
  }
}

.ellipses input {
  text-overflow: ellipsis;
}

.squared-left-button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>