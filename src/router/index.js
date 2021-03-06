import Vue from 'vue';
import VueRouter from 'vue-router';
import Mods from '../views/Mods.vue';
import Browse from '../views/Browse.vue';
import Settings from '../views/Settings.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Mods',
    component: Mods
  },
  {
    path: '/browse',
    name: 'Browse',
    component: Browse
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
];

const router = new VueRouter({
  routes
});

export default router;
