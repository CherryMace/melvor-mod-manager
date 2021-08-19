<template>
  <v-list-item :disabled="disabled" :value="mod.id" class="pl-0 theme-color-dark mb-2" active-class="theme-color">
    <div class="mod pa-4 d-flex align-center" :class="{ disabled: mod.disabled }">
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
              <v-icon color="success">arrow_circle_up</v-icon>
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
    }
  }
}
</script>

<style lang="scss">
.mod {
  width: 100%;
  border-radius: 4px;
  border-left: 0.5rem solid #aeea00;

  &.disabled {
    border-color: hsla(0, 0, 100%, 0.5);

    .title {
      text-decoration: line-through;
    }
  }
}

.load-order {
  height: 75px;
}

.selected-mod {
  background-color: #fff;
}
</style>