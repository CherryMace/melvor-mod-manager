<template>
  <v-list-item :disabled="disabled" :value="mod.id" :class="isSelected ? 'lime accent-4' : 'blue-grey darken-4'">
    <div class="mod pa-4 d-flex align-center blue-grey darken-1">
      <div class="load-order d-flex align-center mr-3">
        <h3 class="text-h3 text--disabled">{{ loadOrder }}</h3>
      </div>
      <div>
        <h4 class="title">{{ mod.name }}</h4>
        <h5 class="caption text--secondary" v-if="mod.description">{{ mod.description }}</h5>
      </div>
      <v-spacer />
      <div class="px-5">
        <v-progress-circular v-if="loading" :size="25" indeterminate />
      </div>
      <div class="text-right">
        <div v-if="mod.version">v{{ mod.version }}</div>
        <v-tooltip bottom>
          <template v-slot:activator="{ attrs, on }">
            <div v-if="mod.updateAvailable" class="body-2" v-bind="attrs" v-on="on">
              <font-awesome-icon class="green--text" :icon="['fas', 'arrow-circle-up']" />
              v{{ mod.updateAvailable }}
            </div>
          </template>
          <span>Update available</span>
        </v-tooltip>
        <div><h6 class="caption text--secondary">Source: {{ source }}</h6></div>
      </div>
    </div>
  </v-list-item>
</template>

<script>
export default {
  props: ['mod', 'loadOrder', 'loading', 'disabled'],
  computed: {
    source () {
      if (!this.mod.origin) return 'File';
      if ((/^https?:\/\/(www\.)?greasyfork\.org/).test(this.mod.origin))
        return 'Greasy Fork';
      return 'Unknown';
    },
    isSelected () {
      return this.mod.id === this.$store.state.selectedMod;
    }
  }
}
</script>

<style lang="scss" scoped>
.mod {
  width: 100%;
}

.load-order {
  height: 75px;
}
</style>