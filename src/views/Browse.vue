<template>
  <v-container fluid class="d-flex flex-column flex-grow-1">
    <section class="d-flex flex-grow-0">
      <v-text-field rounded filled clearable dense append-icon="search" placeholder="Search..." color="white" class="flex-grow-1" v-model="search"></v-text-field>
      <v-btn tile plain icon :disabled="isLoading" @click="refresh" class="ml-2"><v-icon>refresh</v-icon></v-btn>
    </section>
    <section key="loader" v-if="isLoading" class="flex-grow-1 d-flex align-center justify-center">
        <v-progress-circular indeterminate></v-progress-circular>
    </section>
    <section key="content" v-else style="flex-basis: 0" class="flex-grow-1 overflow-x-hidden">
      <v-slide-y-transition>
        <article v-if="!search">
          <h3 class="title">Featured</h3>
          <v-divider class="mb-2" />
          <v-row dense>
            <v-col v-for="mod in featuredMods" :key="`${mod.title}-featured`" :cols="mod.featured === 'main' ? 12 : 6">
              <browser-mod :feature="true" :mod="mod" :disabled="disabled" />
            </v-col>
          </v-row>
        </article>
      </v-slide-y-transition>

      
      <v-slide-y-transition>
      <article v-if="!search">
        <h3 class="title mt-5">All Mods</h3>
        <v-divider class="mb-2" />
        <v-row dense>
          <v-col :cols="12" v-for="mod in unfeaturedMods" :key="mod.title">
            <browser-mod :mod="mod" :disabled="disabled" />
          </v-col>
        </v-row>
      </article>
      </v-slide-y-transition>

      <v-fade-transition>
      <article v-if="search">
        <v-row dense>
          <v-col :cols="12" v-for="mod in searchResultMods" :key="mod.title">
            <browser-mod :mod="mod" :disabled="disabled" />
          </v-col>
        </v-row>
      </article>
      </v-fade-transition>
    </section>
  </v-container>
</template>

<script>
import BrowserMod from '../components/BrowserMod.vue';

export default {
  components: { BrowserMod },
  data () {
    return {
      isLoading: false,
      search: '',
    }
  },
  computed: {
    disabled () {
      return !this.$store.state.isValidDir;
    },
    mods () {
      return this.$store.state.browserMods;
    },
    featuredMods () {
      const featured = this.mods.filter(mod => mod.featured);
      featured.sort((a, b) => a.featuredOrder - b.featuredOrder);
      return featured;
    },
    unfeaturedMods () {
      return this.mods.filter(mod => !mod.featured);
    },
    searchResultMods () {
      return this.mods.filter(mod =>  mod.title.toLowerCase().search(this.search.toLowerCase()) > -1);
    }
  },
  methods: {
    async refresh () {
      this.isLoading = true;
      await this.$store.dispatch('loadBrowser');
      // Add a manual wait time to improve feel (counterintuitive, I know)
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.isLoading = false;
    }
  }
}
</script>