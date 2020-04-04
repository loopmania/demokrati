import Vue from 'vue'
import io from 'socket.io-client'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false


new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
  data: {
    io: io('https://localhost:8443', {
      autoConnect: false,
      secure: true,
      rejectUnauthorized: false,
      
    }),
    socket: io.connect()
  },

}).$mount('#app')
