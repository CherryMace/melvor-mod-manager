<template>
  <v-system-bar class="blue-grey darken-4 pa-0" window>
    <div class="system-draggable-area"></div>
    <v-spacer />
    <v-btn small tile depressed color="blue-grey darken-4" height="32" @click="minimize">
      <font-awesome-icon :icon="['fas', 'window-minimize']"></font-awesome-icon>
    </v-btn>
    <v-btn small tile depressed color="blue-grey darken-4" height="32" @click="maximize">
      <font-awesome-icon :icon="['fas', 'window-maximize']"></font-awesome-icon>
    </v-btn>
    <v-btn small tile depressed color="blue-grey darken-4" height="32" @click="close">
      <font-awesome-icon :icon="['fas', 'times']"></font-awesome-icon>
    </v-btn>
  </v-system-bar>
</template>

<script>
import { process } from '@/api';

export default {
  methods: {
    minimize () {
      process.minimize();
    },
    maximize () {
      process.maximize();
    },
    close () {
      process.exit();
    }
  }
}
</script>

<style lang="scss">

.system-draggable-area {
  margin: 10px 0 0 10px;
  width: 100%;
  height: 100%;
  -webkit-app-region: drag;
}

.v-system-bar button {
  padding: 0 12px !important;
}
</style>