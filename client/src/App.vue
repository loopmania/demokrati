<template>
  <v-app>
    <Alerter/>
    <Navbar/>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
import Navbar from './components/Navbar';
import Alerter from './components/Alerter';
export default {
  name: 'App',
  components: {
    Navbar, Alerter
  },
  beforeDestroy() {
    this.$root.$data.socket.removeAllListeners();
  },
  created() {
    this.$root.$data.socket.on('connect', this.findMe);
    this.$root.$data.socket.on('refresh', this.refresh);
  },
  methods: {
    findMe() {
      this.$store.dispatch('findMe')
        .then(result => {
          if(result.status === 'success' && result.user !== undefined) {
            this.$root.$data.socket.emit('join', 'sm');
            if(result.user.admin === true) {
              this.$root.$data.socket.emit('join', 'admin');
            }
          }
        })
        .catch(error => {
          if(error.status) {
            this.$store.commit('alertClient', {
              color: 'error',
              text: error.msg,
              timeout: 6000,
              snackbar: true,
              action: {
                method: 'exit',
                text: 'Stäng'
              }
            });
          }
        })
    },
    refresh() {
      this.$store.dispatch('checkTime')
        .then(result => {
          const time = 3 * 60 * 1000;
          const timer = setTimeout(() => {
            this.$store.dispatch('destroyToken');
          }, time);
          if(result.status === 'bad') {
            
            this.$store.commit('alertClient', {
              color: 'warning',
              text: 'Är du fortfarande kvar?',
              timeout: time,
              snackbar: true,
              action: {
                method: 'update',
                text: 'Ja',
                timer: timer
              }
            })
          } else {
            console.log(result.msg);
            clearTimeout(timer);
          }
        })
        .catch(() => {
          this.$store.dispatch('destroyToken');
        });
    },
  }
};
</script>
<style>
html {
  overflow-y: auto !important;
}

</style>
