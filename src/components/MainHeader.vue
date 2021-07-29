<template>
  <v-container fluid class="blue-grey darken-2 px-6 px-lg-0">
    <v-row class="align-center">
      <v-col cols="12" sm="2" lg="1" class="text-center">
        <logo />
      </v-col>

      <v-spacer class="d-none d-lg-block" />

      <v-col cols="10" sm="9" lg="8" xl="6">
        <melvor-locator />
      </v-col>

      <v-spacer class="d-none d-lg-block" />

      <v-col cols="2" sm="1" style="text-align: center;">
        <melvor-launcher :disabled="disabled" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Logo from './Logo.vue';
import MelvorLocator from './MelvorLocator.vue';
import MelvorLauncher from './MelvorLauncher.vue';

export default {
  components: { Logo, MelvorLocator, MelvorLauncher },
  props: ['disabled']
};
</script>