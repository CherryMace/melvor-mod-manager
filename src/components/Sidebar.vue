<template>
  <v-navigation-drawer app permanent floating color="#05090c" width="148">
    <div class="d-flex align-center justify-center pa-1 mb-1">
      <v-avatar size="64" tile>
        <v-img src="@/assets/m3-smaller.png"></v-img>
      </v-avatar>
    </div>
    <v-list dense nav>
      <v-list-item-group color="teal lighten-2">

        <v-list-item v-for="item in navItems" :key="item.title" link :to="item.link">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  data () {
    return {
      navItems: [
        {
          title: 'Discover',
          icon: 'extension',
          link: '/browse'
        },
        {
          title: 'My Mods',
          icon: 'list',
          link: '/'
        },
        {
          title: 'Settings',
          icon: 'settings',
          link: '/settings'
        }
      ]
    }
  }
}
</script>