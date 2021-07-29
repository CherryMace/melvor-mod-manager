<template>
  <section>
    <v-overlay absolute :value="$store.state.isLoadingMods">
      <v-progress-circular indeterminate />
    </v-overlay>
    <v-list-item-group @change="onChangeSelectedMod">
      <Mod
        v-for="(mod, i) in mods"
        :key="mod.id"
        :mod="mod"
        :loadOrder="i + 1"
        :loading="modBeingUpdated === mod.id"
        :disabled="disabled || modBeingUpdated === mod.id"
        />
    </v-list-item-group>
  </section>
</template>

<script>
import { mapState } from 'vuex';

import Mod from './Mod.vue';

export default {
  components: { Mod },
  props: ['disabled'],
  computed: {
    ...mapState(['mods', 'modBeingUpdated'])
  },
  methods: {
    onChangeSelectedMod (id) {
      this.$store.dispatch('selectMod', id);
    }
  }
}
</script>

<style lang="scss" scoped>
section {
  flex-basis: 0;
  overflow-y: auto;
}
</style>