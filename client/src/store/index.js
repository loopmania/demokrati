import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    authenticated: false,
    active: false,
    error: {
      color: null,
      text: null,
      timeout: null,
      snackbar: false,
      action: {
        method: null,
        text: null
      },
    }
  },
  getters: {
    loggedIn(state) {
      return state.authenticated;
    },
    hasActivated(state) {
      return state.active;
    },
    alertError(state) {
      return state.error;
    }
  },
  mutations: {
    setToken(state, token) {
      localStorage.setItem('access_token', token);
      state.token = token;
    },
    setRefreshToken(state, token) {
      localStorage.setItem('refresh_token', token);
      state.refreshToken = token;
    },
    destroyToken(state) {
      state.token = null;
    },
    setAuthenticated(state, status) {
      state.authenticated = status;
    },
    activate(state) {
      state.active = true;
    },
    invalidateEverything(state) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      state.token = null;
      state.authenticated = false;
    },
    alertClient(state, payload) {
      state.error = payload;
    }
  },
  actions: {
    destroyToken(context) {
      if(context.getters.loggedIn) {
        return new Promise((resolve, reject) => {
          fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // should add token to auth a logout?
            }
          })
          .then(resp => {
            context.commit('invalidateEverything');
            resolve(resp);
          })
          .catch(error => {
            context.commit('invalidateEverything');
            reject(error);
          });
        });
      }
    },
    refresh(context) {
      context.dispatch('authenticate')
        .then(status => {
          if(status === 'success') {
            console.log('refreshed token');
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
    authenticate(context) {
      return new Promise((resolve, reject) => {
        fetch('/api/refresh', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': context.state.token
          },
          body: JSON.stringify({
            refreshToken: context.state.refreshToken
          })
        })
          .then(resp => {
            return resp.json();
          })
          .then(data => {
            console.log(data);
            if(data.status === 'bad') {
              context.commit('invalidateEverything');
              reject(data.msg);
            }
            if(data.status === 'success') {
              // code 8 is for when a refreshToken is not present on client
              if(![8, 13].includes(data.code)) {
                context.commit('setToken', data.token);
                context.commit('setAuthenticated', true);
              }
              resolve(data.status);
            }
          })
          .catch((error) => {
            console.log(error);
            context.commit('invalidateEverything');
          });
      });
    },
    activate(context, payload) {
      return new Promise((resolve, reject) => {
        fetch('/api/activate', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              email: payload.email.toLowerCase()
          })
        })
          .then(resp => {
            return resp.json();
          })
          .then(data => {
            let error;
            if(data.status === "bad") {
              error = {
                color: 'error',
                text: data.msg
              };
              reject(error);
            }
            if(data.status === "success") {
              context.commit('setToken', data.token);
              context.commit('activate');
              //send mail
              console.log(data.code); // remove in production
              resolve(data.status);
            }
          });
      });
    },
    verify(context, payload) {
      return new Promise((resolve,reject) => {
        fetch('/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': context.state.token
          },
          body: JSON.stringify({
            code: payload.code
          })
        })
          .then(resp => {
            return resp.json();
          })
          .then(data => {
            let error;
            if(data.status === "bad") {
              error = {
                color: 'error',
                text: data.msg
              };
              reject(error);
            }
            if(data.status === "success") {
              context.commit('setRefreshToken', data.refreshToken);
              context.commit('setAuthenticated');
              // should check if admin here
              resolve(data.status);
            }
          })
      })
    },
    findVote(context) {
      return new Promise((resolve, reject) => {
        fetch('/api/findVote', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': context.state.token
          }
        })
          .then(resp => {
            return resp.json();
          })
          .then(data => {
            if(data.status === "bad") {
              reject(data);
            }
            if(data.status === "success") {
              resolve(data);
            }
            
          })
      })
    },

  },
  modules: {
  }
})
