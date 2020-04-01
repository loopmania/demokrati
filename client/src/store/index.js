import Vue from 'vue'
import Vuex from 'vuex'
import router from '../router'
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
    },
    token(state) {
      return state.token;
    },
    refreshToken(state) {
      return state.refreshToken;
    }
  },
  mutations: {
    setToken(state, token) {
      localStorage.removeItem('access_token');
      localStorage.setItem('access_token', token);
      state.token = token;
    },
    setRefreshToken(state, token) {
      localStorage.removeItem('refresh_token');
      localStorage.setItem('refresh_token', token);
      state.refreshToken = token;
    },
    destroyToken(state) {
      state.token = null;
    },
    setAuthenticated(state, status) {
      console.log('authenticating');
      state.authenticated = status;
    },
    activate(state) {
      state.active = true;
    },
    invalidateEverything(state) {
      router.push({path: '/Logout'});
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      state.token = null;
      state.authenticated = false;
    },
    invalidateLogin(state) {
      localStorage.removeItem('access_token');
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
            method: 'GET',
            headers: {
              'Authorization': context.state.token, // should add token to auth a logout?
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
            'Authorization': context.getters.token || localStorage.getItem('access_token')
          },
          body: JSON.stringify({
            refreshToken: context.getters.refreshToken || localStorage.getItem('refresh_token')
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
              resolve(data);
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
            console.log('weed');
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
              context.commit('setAuthenticated', true);
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
    createPoll(context, payload) {
      return new Promise((resolve, reject) => {
        fetch('/api/admin/createPoll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': context.getters.token
          },
          body: JSON.stringify({
            poll: payload
          })
        })
          .then(res => {
            return res.json();
          })
          .then(data => {
            if(data.status === 'success') {
              resolve();
            }
            if(data.status === 'bad') {
              reject(data);
            }
          })
          .catch(error => {
            reject(error);
          })
      })
    },
    editPoll(context, payload) {
      return new Promise((resolve, reject) => {
        fetch('/api/admin/editPoll', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': context.getters.token
          },
          body: JSON.stringify({
            id: payload.id,
            title: payload.title,
            candidates: payload.candidates
          })
        })
          .then(res => {
            return res.json();
          })
          .then(data => {
            if(data.status === 'success') {
              resolve(data);
            }
            if(data.status === 'bad') {
              reject(data);
            }
          })
          .catch(error => {
            reject(error);
          })
      });
    },
    getPolls(context) {
      return new Promise((resolve, reject) => {
        fetch('/api/admin/polls', {
          method: 'GET',
          headers: {
            'Authorization': context.getters.token
          }
        })
          .then(res => {
            return res.json();
          })
          .then(data => {
            if(data.status === 'success') {
              resolve(data);
            }
            if(data.status === 'bas') {
              reject();
            }
          })
          .catch(() => {
            //
          })
      })
    },
    vote(context, payload) {
      return new Promise((resolve, reject) => {
        fetch('/api/vote', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': context.getters.token
          },
          body: JSON.stringify({
            candidate: payload.candidate,
            poll: payload.poll
          })
        })
          .then(res => {
            return res.json()
          })
          .then(data => {
            if(data.status === 'success') {
              resolve();
            }
             else {
               reject(data);
             }
          })
          .catch(error => {
            reject(error);
          })
      });
    },
    activatePoll(context, pollID) {
      return new Promise((resolve, reject) => {
        fetch('/api/admin/invokePoll', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': context.getters.token
          },
          body: JSON.stringify({
            pollID: pollID
          })
        })
            .then(res => {
              return res.json();
            })
            .then(data => {
              if(data.status === 'success') {
                resolve(data);
              }
              if(data.status === 'bad') {
                reject(data);
              }
            })
            .catch(error => {
              reject(error);
            })
        })
    },
    getResults(context, pollID) {
      return new Promise((resolve, reject) => {
        fetch('/api/admin/results', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': context.getters.token
          },
          body: JSON.stringify({
            pollID: pollID
          })
        })
            .then(res => {
              return res.json();
            })
            .then(data => {
              if(data.status === 'success') {
                resolve(data);
              }
              if(data.status === 'bad') {
                reject(data);
              }
            })
            .catch(error => {
              reject(error);
            })
          })
    },
    isAdmin(context) {
      return new Promise((resolve, reject) => {
        fetch('/api/admin/me', {
          method: 'GET',
          headers: {
            'Authorization': context.state.token
          }
        })
          .then(res => {
            return res.json();
          })
          .then(data => {
            resolve(data);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    isMember(context) {
      return new Promise((resolve, reject) => {
        fetch('/api/me', {
          method: 'GET',
          headers: {
            'Authorization': context.state.token
          }
        })
          .then(res => {
            return res.json();
          })
          .then(data => {
            if(data.status === 'success') {
              if(data.code === 12) {
                context.commit('setAuthenticated', true);
              } else {
                context.commit('setAuthenticated', false);
              }
            } else {
              context.commit('setAuthenticated', false);
            }
            resolve(data);
          })
          .catch(error => {
            context.commit('setAuthenticated', false);
            reject(error);
          });
      });
    },
    checkTime(context) {
      return new Promise((resolve,reject) => {
        fetch('/api/timeleft', {
          method: 'GET',
          headers: {
            'Authorization': context.state.token
          }
        })
          .then(res => {
            return res.json();
          })
          .then(data => {
            resolve(data);
          })
          .catch(error => {
            reject(error);
          });
      })
    }
  },
  modules: {
  }
})
