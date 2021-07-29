<template>
  <v-app>
    <v-main class="blue-grey darken-3">
      <div class="d-flex flex-column fill-height">
        <system-bar class="flex-grow-0 flex-shrink-0" />
        <v-container class="flex-column pa-0" fill-height fluid>
          <main-header class="flex-grow-0 flex-shrink-0" :disabled="!isValidDir" />
          <main-view :disabled="!isValidDir" />
        </v-container>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import { mapState } from 'vuex';

import SystemBar from './components/SystemBar.vue';
import MainHeader from './components/MainHeader.vue';
import MainView from './components/MainView.vue';

export default {
  name: 'App',
  components: { SystemBar, MainHeader, MainView },
  computed: {
    ...mapState(['isValidDir'])
  },
  created () {
    this.$store.dispatch('loadSavedState');
  }
};
</script>

<style lang="scss">
html {
  overflow: hidden;
}

:not(input):not(textarea),
:not(input):not(textarea)::after,
:not(input):not(textarea)::before {
    -webkit-user-select: none;
    user-select: none;
}
input, button, textarea, :focus {
    outline: none; // You should add some other style for :focus to help UX/a11y
}

*::-webkit-scrollbar {
  width: 10px;
}
*::-webkit-scrollbar-corner {
    background: rgba(0,0,0,0);
}
*::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 6px;
    border: 2px solid rgba(0,0,0,0);
    background-clip: content-box;
    min-width: 32px;
    min-height: 32px;
}
*::-webkit-scrollbar-track {
    background-color: rgba(0,0,0,0);
}
</style>