<template>
  <v-card flat color="#05090c">

    <component v-if="featured" :is="mod.featuredImage ? 'v-img' : 'v-sheet'" :height="mod.featured === 'main' ? '125px' : '82px'" :src="mod.featuredImage" :color="`${mod.featuredColor} darken-3`">
      <v-card-title>
        <v-avatar size="48" color="transparent">
          <v-img v-if="mod.icon" :src="mod.icon"></v-img>
        </v-avatar>
        <span class="ml-3">{{ mod.title }}</span>
        <span class="caption text--disabled ml-2">by {{ mod.authors.join(', ') }}</span>
      </v-card-title>
    </component>

    <v-card-actions>

      <v-card-title v-if="!featured" class="pa-0">
        <v-avatar size="36" color="transparent">
          <v-img v-if="mod.icon" :src="mod.icon"></v-img>
        </v-avatar>
        <span class="ml-3 text-subtitle-2">{{ mod.title }}</span>
        <span class="caption text--disabled ml-2">by {{ mod.authors.join(', ') }}</span>
      </v-card-title>

      <version-chip :small="!featured" :version="mod.version" :targetGameVersion="mod.targetGameVersion" />
      <v-spacer />
      <v-btn plain color="info" :small="!featured" @click="openDetails">{{ featured ? 'More Details' : 'Details' }}</v-btn>
      <v-btn color="lime darken-2" :small="!featured" :disabled="isInstalled" :loading="installing" @click="install">
        {{ isInstalled ? 'Installed' : 'Install' }}
        <v-icon small>{{ isInstalled ? 'done' : 'add' }}</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { VImg, VSheet } from 'vuetify/lib';
import { process, mods } from '@/api';
import VersionChip from './VersionChip.vue';

export default {
  components: { VImg, VSheet, VersionChip },
  props: ['mod', 'feature'],
  data () {
    return {
      installing: false
    };
  },
  computed: {
    featured () {
      return this.feature && this.mod.featured; 
    },
    isInstalled () {
      return this.$store.getters.isModInstalled(this.mod.id);
    }
  },
  methods: {
    async openDetails () {
      await process.openLink(this.mod.info);
    },
    async install () {
      this.installing = true;
      console.log(this.mod);
      const installedMod = await mods.browserInstall(this.$store.state.dir, this.mod);
      await this.$store.dispatch('loadMod', installedMod.id);
      this.installing = false;
    }
  }
}
</script>