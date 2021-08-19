<template>
  <v-system-bar class="test-color-dark pa-0" app window>
    <div class="system-draggable-area"></div>
    <v-spacer />
    <v-btn small tile depressed color="transparent" height="32" @click="minimize">
      <v-icon small>minimize</v-icon>
    </v-btn>
    <v-btn small tile depressed color="transparent" height="32" @click="maximize">
      <v-icon small>web_asset</v-icon>
    </v-btn>
    <v-btn small tile depressed color="transparent" height="32" @click="close">
      <v-icon small>close</v-icon>
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

.v-system-bar {
  background: linear-gradient(90deg, #05090c 148px, #111b27 100%);
}

.v-system-bar button {
  padding: 0 12px !important;
}
</style>