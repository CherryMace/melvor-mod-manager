<template>
  <v-card color="#05090c">
    <v-card-title>Add From URL</v-card-title>
    <v-card-text>
      <v-container fluid>
        <v-row class="mb-1" no-gutters>
          <v-col cols="12">
            <v-text-field solo-inverted flat dense single-line v-model="url" ref="urlTextField" hide-details @keydown.enter="add"></v-text-field>
          </v-col>
        </v-row>
        <div v-show="error" class="red--text">{{ error }}</div>
        <div>GreasyFork URLs are accepted. Example: <pre>https://greasyfork.org/en/scripts/script-id-and-name</pre></div>
        <div>Github repositories are also accepted. Example: <pre>https://github.com/user/repository.git</pre></div>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn @click="closeDialog" depressed plain>Cancel</v-btn>
      <v-btn @click="add" color="primary" depressed :disabled="!validUrl" :loading="loading">Add</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mods } from '@/api';
import { isGreasyForkUrl, isGitUrl } from '@/util';

export default {
  props: ['promptMoreInfo', 'isOpen', 'close'],
  data () {
    return {
      url: '',
      loading: false,
      error: ''
    };
  },
  computed: {
    validUrl () {
      return (isGreasyForkUrl(this.url) || isGitUrl(this.url));
    }
  },
  methods: {
    async add () {
      this.error = '';
      if (!this.url || !this.validUrl) {
        this.error = 'A valid URL is required.';
        return;
      }
      this.loading = true;
      let res;
      if (isGreasyForkUrl(this.url)) {
        res = await mods.parseWeb(this.url);
        if (res.manifest.name) {
          const mod = await mods.add(this.$store.state.packageDir, this.url, res.manifest, res.content);
          if (mod.error) {
            this.error = mod.error;
            this.loading = false;
            return;
          }
          await this.$store.dispatch('loadMod', mod.id);
        } else {
          this.promptMoreInfo(res.manifest, this.url, res.content);
        }
        this.closeDialog();
      } else if (isGitUrl(this.url)) {
        res = await mods.cloneGit(this.url, this.$store.state.packageDir);
        if (res.error) {
          this.error = res.error;
          this.loading = false;
          return;
        }
        await this.$store.dispatch('loadMod', res.id);
        this.closeDialog();
      }
      if (res.error) { 
        this.error = res.error;
        this.loading = false;
        return;
      }
    },
    resetDialog () {
      this.url = '';
      this.loading = false;
      this.error = '';
    },
    closeDialog () {
      this.resetDialog();
      this.close();
    }
  },
  created () {
    if (this.isOpen) setTimeout(() => this.$refs.urlTextField.focus());
  },
  watch: {
    isOpen (val) {
      if (val) setTimeout(() => this.$refs.urlTextField.focus());
      else {
        this.resetDialog();
      }
    }
  }
}
</script>
