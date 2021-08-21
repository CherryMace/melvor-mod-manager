<template>
  <v-container fluid>
    <v-tabs background-color="transparent" color="lime accent-4" v-model="tab">
      <v-tab href="#general">General</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab" class="px-2 transparent">
      <v-tab-item value="general">
        <v-form>
          <v-checkbox v-model="checkForUpdates">
            <template v-slot:label>
              <div>Automatically check for updates to mods
                <v-tooltip right max-width="350" color="#05090c">
                  <template v-slot:activator="{ attrs, on }">
                    <v-icon v-bind="attrs" v-on="on" color="grey darken-1">help_outline</v-icon>
                  </template>
                  <p class="mb-0">Only works for supported sources:</p>
                  <ul>
                    <li>GreasyFork</li>
                  </ul>
                </v-tooltip>
              </div>
            </template>
          </v-checkbox>

          <v-radio-group v-model="launchMode">
            <template v-slot:label>
              <div class="text-body-1">Melvor Idle launch behavior
                <v-tooltip right max-width="350" color="#05090c">
                  <template v-slot:activator="{ attrs, on }">
                    <v-icon v-bind="attrs" v-on="on" color="grey darken-1">help_outline</v-icon>
                  </template>
                  <p><strong class="lime--text">Using Steam:</strong> Launch Melvor Idle as if it's being launched through Steam. This enables achievements. <em>(Recommended)</em></p>
                  <p class="mb-0"><strong class="lime--text">Using Melvor Idle.exe:</strong> Launches Melvor directly through the executable, which won't directly integrate with Steam. Primarily useful if you have modified Steam launch options for Melvor Idle to launch M3 instead.</p>
                </v-tooltip>
              </div>
            </template>
            <v-radio value="steam">
              <template v-slot:label>
                <div>Launch using Steam</div>
              </template>
            </v-radio>
            <v-radio value="exe">
              <template v-slot:label>
                <div>Launch using Melvor Idle.exe</div>
              </template>
            </v-radio>
          </v-radio-group>
          
          <v-checkbox label="Close M3 upon launching Melvor Idle" v-model="closeOnLaunch" />
        </v-form>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      tab: 'general'
    };
  },
  computed: {
    checkForUpdates: {
      get () {
        return this.$store.state.checkForUpdates;
      },
      set (value) {
        this.$store.dispatch('changeSetting', { key: 'checkForUpdates', value });
      }
    },
    launchMode: {
      get () {
        return this.$store.state.launchMode;
      },
      set (value) {
        this.$store.dispatch('changeSetting', { key: 'launchMode', value });
      }
    },
    closeOnLaunch: {
      get () {
        return this.$store.state.closeOnLaunch;
      },
      set (value) {
        this.$store.dispatch('changeSetting', { key: 'closeOnLaunch', value });
      }
    }
  }
}
</script>

<style lang="scss">
.v-input--radio-group legend.v-label {
  cursor: default !important;
}
</style>