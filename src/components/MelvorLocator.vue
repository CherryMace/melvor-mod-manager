<template>
    <v-form>
      <v-row no-gutters>
        <v-col cols="10" lg="11">
          <div @dblclick="promptDirectory">
            <v-text-field class="squared-text-field ellipses" flat solo tile dense disabled single-line v-model="dir" hide-details>
              <template v-slot:prepend-inner>
                <font-awesome-icon :icon="display[result].icon" :color="display[result].color"></font-awesome-icon>
              </template>
            </v-text-field>
          </div>
        </v-col>
        <v-col cols="2" lg="1">
          <v-btn block height="38" color="lighten-1" class="squared-left-button" :class="result === 'success' ? 'blue-grey text--secondary' : 'primary'" :disabled="openingDirectory" depressed @click="promptDirectory">
            <span class="d-none d-sm-inline">Browse</span>
            <font-awesome-icon class="d-sm-none" :icon="['fas', 'search']"></font-awesome-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
</template>

<script>
import { mapState } from 'vuex';

import { file } from '@/api';

export default {
  data () {
    return {
      openingDirectory: false,
      display: {
        'success': { icon: ['fas', 'check-circle'], color: '#4caf50' },
        'failure': { icon: ['fas', 'times-circle'], color: '#ff5252' },
        'none': { icon: ['fas', 'folder'], color: 'inherit' }
      }
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
    }
  }
};
</script>

<style lang="scss">
.squared-text-field {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;

  .v-input__slot {
    background-color: #263238 !important;
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