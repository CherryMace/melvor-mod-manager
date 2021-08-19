<template>
  <v-navigation-drawer app permanent floating color="#05090c" width="148">
    <div class="d-flex align-center justify-center pa-1 mb-1">
      <v-avatar size="64" tile>
        <v-img src="@/assets/m3-smaller.png"></v-img>
      </v-avatar>
    </div>
    <v-list dense nav>
      <v-list-item-group color="teal lighten-2">
        <v-list-item link to="/">
          <v-list-item-icon>
            <v-icon>view_list</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Mods</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link to="/settings">
          <v-list-item-icon>
            <v-icon>settings</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>
