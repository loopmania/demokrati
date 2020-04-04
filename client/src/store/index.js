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
    },
    actions: 'Lägg till en ny omröstning',
    pollID: null,
    title: '',
    candidates: [],
    showPollCreator: false,
    newPoll: true,
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
    },
    actions(state) {
      return state.actions;
    },
    title(state) {
      return state.title;
    },
    pollid(state) {
      return state.pollID;
    },
    candidates(state) {
      return state.candidates;
    },
    showPollCreator(state) {
      return state.showPollCreator;
    },
    newPoll(state) {
      return state.newPoll;
    }
  },
  mutations: {
    actions(state, payload) {
      state.actions = payload;
    },
    title(state, payload) {
      state.title = payload;
    },
    pollID(state, payload) {
      state.pollID = payload;
    },
    candidates(state, payload) {
      if(payload.length > 1) {
        let data = []
        payload.forEach(candidate => data.push({text: candidate}));
        state.candidates = data;
      } else {
        state.candidates = payload;
      }
      
    },
    addCandidate(state, payload) {
      state.candidates.push({text: payload});
    },
    showPollCreator(state, payload) {
      state.showPollCreator = payload;
    },
    newPoll(state, payload) {
      if(payload === true) {
        state.actions = 'Lägg till en ny omröstning';
        state.title = '';
        state.candidates = [
          {
            text: 'Blankt'
          }, 
          {
            text: 'Avslag'
          }];
      }
      state.newPoll = payload;
    },
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
    findMe(context) {
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
            if(data.status === 'success' && data.user !== undefined) {
              context.commit('setToken', data.token);
              context.commit('setAuthenticated', true);
              resolve(data);
            }
            if(data.status === 'bad') {
              context.commit('invalidateEverything');
              reject(data);
            }
          })
          .catch(() => {
            context.commit('invalidateEverything');
          })
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
            'Authorization': context.getters.token
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
              resolve(data);
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
    removePoll(context, payload) {
      return new Promise((resolve, reject) => {
        fetch('/api/admin/removePoll', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': context.getters.token
          },
          body: JSON.stringify({
            id: payload
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
    isAuthenticated(context, guard) {
      return new Promise((resolve, reject) => {
        fetch('/api/me', {
          method: 'GET',
          headers: {
            'Authorization': context.getters.token
          }
        })
          .then(res => {
            return res.json();
          })
          .then(data => {
            if(data.status === 'success' && data.user !== undefined) {
              context.commit('setAuthenticated', true);
              if(data.user.admin !== undefined && guard.needAdmin === true) {
                if(data.user.admin === true) {
                  resolve(data.user);
                } else {
                  reject();
                }
              }
              // add present and signed in here
              resolve(null);
            } else {
              context.commit('setAuthenticated', false);
              reject();
            }
          })
          .catch(error => {
            console.log(error);
            reject();
          });
      })
    },
    validateMember(context, payload) {
        // TODO:
      return new Promise((resolve, reject) => {
        fetch('/api/admin/validateMember', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': context.getters.token
          },
          body: JSON.stringify({
            email: payload // payload is currently only a email
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
              reject();
            }
          })
          .catch(error => {
            reject(error);
          })
      })
    },
    invalidateMember(context, payload){
        return new Promise((resolve, reject) => {
          fetch('/api/admin/invalidateMember', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': context.getters.token
            },
            body: JSON.stringify({
              email: payload.email,
              name: payload.name
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
    getValidMembers(context) {
      return new Promise((resolve, reject) => {
        fetch('/api/admin/validMembers', {
          method: 'GET',
          headers: {
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
    getInvalidMembers(context) {
      return new Promise((resolve, reject) => {
        fetch('/api/admin/invalidMembers', {
          method: 'GET',
          headers: {
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
    addNewMember(context, payload){
        // TODO: kontrollera att personen inte redan är medlem!
        const kthmail = payload.email.replace('@kth.se','');

        return new Promise((resolve, reject) => {
            fetch('https://api.kottnet.net/kth/' + kthmail) // gets name from email
            .then(result => {
                if (result.status === 200){
                    result.json().then(data => {
                        const name = data.name;
                        fetch('/api/admin/createMember', { // adds new member to the database
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': context.getters.token
                            },
                            body: JSON.stringify({
                              name: name,
                              email: payload.email
                            })
                        })
                        .then(res => {
                          return res.json();
                        })
                        .then(data => {
                            if(data.status === 'success') {
                                context.dispatch("validateMember", payload.email); //validates the member
                                resolve();
                            }
                            if (data.status === 'bad'){
                                reject(data);
                            }
                        })
                        .catch(error => {
                            reject(error);
                        })
                    })
                }
            })
        })
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
