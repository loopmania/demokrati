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
    //this.$root.$data.socket.removeAllListeners();
  },
  created() {
    this.$root.$data.socket.on('connect', this.findAuth);
    this.$root.$data.socket.on('refresh', this.refresh);
  },
  methods: {
    findAuth() {
      this.$store.dispatch('authenticate')
        .then(result => {
          if(result.status === 'success') {
            if(![8, 13].includes(result.code)) {
                this.$store.dispatch('isAdmin')
                  .then(result => {
                    if(result.status === 'success') {
                      this.$root.$data.socket.emit('join', 'admin');
                      this.$root.$data.socket.emit('join', 'sm');
                    } else {
                      this.$root.$data.socket.emit('join', 'sm');
                    }
                  })
                  .catch(() => {
                    //
                  });
            }
          }
        })
        .catch(error => {
          this.$store.commit('alertClient', {
            color: 'error',
            text: error,
            timeout: 6000,
            snackbar: true,
            action: {
              method: 'exit',
              text: 'Stäng'
            }
          });
          this.$store.dispatch('destroyToken');
        });
    },
    refresh() {
      this.$store.dispatch('checkTime')
        .then(result => {
          if(result.status === 'bad') {
            this.$store.commit('alertClient', {
              color: 'warning',
              text: 'Är du fortfarande kvar?',
              timeout: 2 * 60 * 1000,
              snackbar: true,
              action: {
                method: 'update',
                text: 'Ja'
              }
            })
          } else {
            console.log(result.msg);
          }
        })
        .catch(error => {
          console.log(error);
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
