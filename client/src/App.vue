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
        .then(status => {
          if(status === 'success') {
            console.log('authenticated');
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
        });
    },
    refresh() {
      this.$store.commit('alertClient', {
        color: 'warning',
        text: 'Are you still here?',
        timeout: 60 * 1000,
        snackbar: true,
        action: {
          method: 'update',
          text: 'Yes'
        }
      })
    },
  }
};
</script>
<style>
html {
  overflow-y: auto !important;
}

</style>
