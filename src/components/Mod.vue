<template>
  <v-list-item :disabled="disabled" :value="mod.id" :class="borderColor">
    <div class="mod pa-4 d-flex align-center blue-grey darken-1" :class="{ disabled: mod.disabled }">
      <div class="load-order d-flex align-center mr-3">
        <h3 class="text-h3 text--disabled">{{ loadOrder }}</h3>
      </div>
      <div>
        <h4 class="title" :class="{ 'text--disabled': mod.disabled }">{{ mod.name }}</h4>
        <h5 class="caption text--secondary" :class="{ 'text--disabled': mod.disabled }" v-if="mod.description">{{ mod.description }}</h5>
      </div>
      <v-spacer />
      <div class="px-5">
        <v-progress-circular v-if="loading" :size="25" indeterminate />
      </div>
      <div class="text-right">
        <div v-if="mod.version" :class="{ 'text--disabled': mod.disabled }">v{{ mod.version }}</div>
        <v-tooltip v-if="mod.updateAvailable"  bottom>
          <template v-slot:activator="{ attrs, on }">
            <div class="body-2" :class="{ 'text--disabled': mod.disabled }" v-bind="attrs" v-on="on">
              <font-awesome-icon class="green--text" :icon="['fas', 'arrow-circle-up']" />
              v{{ mod.updateAvailable }}
            </div>
          </template>
          <span>Update available</span>
        </v-tooltip>
        <div><h6 class="caption text--secondary" :class="{ 'text--disabled': mod.disabled }">Source: {{ source }}</h6></div>
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
    },
    borderColor () {
      if (this.mod.disabled && this.isSelected) return 'blue-grey darken-3';
      if (this.mod.disabled) return 'blue-grey darken-4';
      if (this.isSelected) return 'lime accent-4';
      return 'lime darken-2';
    }
  }
}
</script>

<style lang="scss" scoped>
.mod {
  width: 100%;

  &.disabled .title {
    text-decoration: line-through;
  }
}

.load-order {
  height: 75px;
}
</style>