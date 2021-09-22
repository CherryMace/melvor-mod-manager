<template>
  <v-tooltip bottom :disabled="upToDate" max-width="250px">
    <template v-slot:activator="{ attrs, on }">
      <v-chip outlined :small="small"
        :color="`${upToDate ? 'lime' : 'orange' } accent-4`"
        class="ml-2"
        v-bind="attrs"
        v-on="on">
        v{{ version }}
      </v-chip>
    </template>
    <span v-if="!upToDate">This mod has not been updated for the latest version of Melvor Idle and may not work.</span>
  </v-tooltip>
</template>

<script>
export default {
  props: ['version', 'targetGameVersion', 'small'],
  computed: {
    upToDate () {
      return this.targetGameVersion === this.$store.state.gameVersion;
    }
  }
}
</script>