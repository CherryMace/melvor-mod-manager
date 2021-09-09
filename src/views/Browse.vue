<template>
  <v-container fluid class="d-flex flex-column flex-grow-1">
    <v-text-field rounded filled clearable dense append-icon="search" placeholder="Search..." color="white" class="flex-grow-0" v-model="search"></v-text-field>
    <section style="flex-grow: 1; flex-basis: 0; overflow-x: hidden;">
      <v-slide-y-transition>
        <article v-if="!search">
          <h3 class="title">Featured</h3>
          <v-divider class="mb-2" />
          <v-row dense>
            <v-col v-for="mod in featuredMods" :key="`${mod.title}-featured`" :cols="mod.featured === 'main' ? 12 : 6">
              <browse-mod :feature="true" :mod="mod" />
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
            <browse-mod :mod="mod" />
          </v-col>
        </v-row>
      </article>
      </v-slide-y-transition>

      <v-fade-transition>
      <article v-if="search">
        <v-row dense>
          <v-col :cols="12" v-for="mod in searchResultMods" :key="mod.title">
            <browse-mod :mod="mod" />
          </v-col>
        </v-row>
      </article>
      </v-fade-transition>
    </section>
  </v-container>
</template>

<script>
import axios from 'axios';
import BrowseMod from '../components/BrowseMod.vue';

export default {
  components: { BrowseMod },
  data () {
    return {
      mods: [],
      search: '',
    }
  },
  computed: {
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
  async created () {
    const res = await axios.get('https://cherrymace.github.io/m3-mod-browser/mods/all.json');
    this.mods = res.data;
  }
}
</script>