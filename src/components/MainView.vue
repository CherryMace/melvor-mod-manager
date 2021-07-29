<template>
  <v-container fluid class="d-flex flex-column flex-grow-1">
    <mod-list-header :disabled="disabled" />
    <v-divider />
    <mod-list v-if="$store.state.mods.length" class="flex-grow-1" :disabled="disabled" />
    <div v-else class="flex-grow-1 d-flex align-center justify-center">
      <span class="caption text--disabled">No mods loaded</span>
    </div>
  </v-container>
</template>

<script>
import ModListHeader from './ModListHeader.vue';
import ModList from './ModList.vue';

export default {
  components: { ModListHeader, ModList },
  props: ['disabled']
}
</script>