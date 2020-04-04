import Vue from 'vue'
import VueRouter from 'vue-router'
import Vote from '../views/Vote.vue'
import Login from '../views/Login.vue'
import Logout from '../components/Logout.vue'
import Actions from '../views/Actions.vue'
import Admin from '../views/Admin.vue'
import store from '../store'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Actions',
    component: Actions
  },
  {
    path: '/vote',
    name: 'Vote',
    component: Vote,
    beforeEnter: (to, from, next) => {
      store.dispatch('isAuthenticated', {needAdmin: false})
        .then(() => {
          next();
        })
        .catch(() => {
          store.commit('alertClient', {
            color: 'warning',
            text: `För att kunna rösta, krävs \
            det att man är inloggad.`,
            timeout: 6000,
            snackbar: true,
            action: {
              method: 'exit',
              text: 'Stäng'
            }
          });
          next('/Login')
        })
    }
  },
  {
    path: '/Login',
    name: 'Login',
    component: Login,
    beforeEnter: (to, from, next) => {
      store.dispatch('isAuthenticated', {needAdmin: false})
        .then(() => {
          next(from.path);
        })
        .catch(() => {
          next();
        })
      }
      
  },
  {
    path: '/Logout',
    name: 'Logout',
    component: Logout,
    beforeEnter: (to, from, next) => {
      store.dispatch('isAuthenticated', {needAdmin: false})
        .then(() => {
          next();
        })
        .catch(() => {
          next(from.path);
        })
      }
  },
  {
    path: '/Admin',
    name: 'Admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      store.dispatch('isAuthenticated', {needAdmin: true})
        .then(result => {
          if(result.admin === true) {
            next();
          } else {
            next(from.path);
          }
        })
        .catch(() => {
          store.commit('alertClient', {
            color: 'error',
            text: `Ditt client saknar adminrättigheter`,
            timeout: 6000,
            snackbar: true,
            action: {
              method: 'exit',
              text: 'Stäng'
            }
          });
          next(from.path);
        })
      }
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
});

export default router
