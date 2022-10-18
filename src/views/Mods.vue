<template>
  <v-container fluid class="d-flex flex-column flex-grow-1">
    <mod-list-header class="pb-3" :disabled="disabled" />
    <v-divider />
    <v-overlay absolute :value="$store.state.isLoadingMods">
      <v-progress-circular indeterminate />
    </v-overlay>
    <!-- <div v-if="disabled" class="flex-grow-1 d-flex align-center justify-center">
      <v-icon color="grey" class="mr-2">arrow_upward</v-icon><span class="caption text--disabled">Select your Melvor Idle installation directory above to get started</span>
    </div> -->
    <div v-if="disabled" class="flex-grow-1 d-flex align-center justify-center">
      <v-icon color="grey" class="mr-2">arrow_upward</v-icon><span class="caption text--disabled">Read the message above - go use the in-game Mod Manager instead!</span>
    </div>
    <mod-list v-else-if="$store.state.mods.length" class="flex-grow-1" :disabled="disabled" />
    <div v-else class="flex-grow-1 d-flex align-center justify-center">
      <span class="caption text--disabled">No mods loaded. Install some from the <router-link to="/browse">Discover</router-link> tab or add them manually above.</span>
    </div>
  </v-container>
</template>

<script>
import ModListHeader from '../components/ModListHeader.vue';
import ModList from '../components/ModList.vue';

export default {
  components: { ModListHeader, ModList },
  computed: {
    disabled () {
      // return !this.$store.state.isValidDir;
      return true;
    }
  }
}
</script>