import Vue from 'vue'
import VueRouter from 'vue-router'
import Vote from '../views/Vote.vue'
import Login from '../views/Login.vue'
import Logout from '../components/Logout.vue'
import Actions from '../views/Actions.vue'
import Admin from '../views/Admin.vue'
import { Store } from 'vuex'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Vote',
    component: Vote
  },
  {
    path: '/Handlingar',
    name: 'Actions',
    component: Actions
  },
  {
    path: '/Login',
    name: 'Login',
    component: Login
  },
  {
    path: '/Logout',
    name: 'Logout',
    component: Logout
  },
  {
    path: '/Admin',
    name: 'Admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      if(Store.state.authenticated) {
        if(Store.state.authenticated.admin) {
          next();
        }
      }
      next(false);
    }
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
