<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <v-btn fab icon tile small v-bind="attrs" v-on="on" :disabled="disabled" :loading="launching" @click="launchMelvor">
        <font-awesome-icon :icon="['fas', 'play']"></font-awesome-icon>
      </v-btn>
    </template>
    <span>Launch Melvor Idle</span>
  </v-tooltip>
</template>

<script>
import { mods, process } from '@/api';

export default {
  props: ['disabled'],
  data () {
    return {
      launching: false
    }
  },
  methods: {
    async launchMelvor () {
      this.launching = true;
      try {
        await mods.inject(this.$store.state.dir, this.$store.state.mods);
        await process.launchMelvor(this.$store.state.dir);
        process.exit();
      } catch (e) {
        console.error(e);
      }
      this.launching = false;
    }
  }
}
</script>