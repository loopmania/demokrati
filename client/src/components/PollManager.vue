<template>
    <div>
        PollManager
        <PollCreator
        @close="resetDialog"/>
        <Results
        :visible="resultDialog"
        :result="result"
        @close="resultDialog = false"/>
        <v-btn
        text
        class="success"
        @click="create()">
            <span>Ny omröstning</span>
         </v-btn>
        <v-expansion-panels
        class="py-8"
        accordion
        v-model="openPanel">
            <v-expansion-panel
            v-for="poll in polls"
            :key="poll.id">
                <v-expansion-panel-header
                expand-icon="expand_more">
                    <strong
                    v-if="poll.active">
                        {{poll.title}}
                    </strong>
                    <span
                    v-else>
                        {{poll.title}}
                    </span>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <v-row no-gutters>
                        <v-btn
                        depressed
                        class="mx-2"
                        color="primary"
                        v-if="!poll.active"
                        @click="activate(poll.id)">
                            <v-icon left>launch</v-icon>
                            <span>Aktivera</span>
                        </v-btn>
                        <v-btn
                        depressed
                        class="mx-2"
                        color="secondary"
                        v-else
                        @click="showResult(poll.id)">
                            <v-icon left>launch</v-icon>
                            <span>Avsluta</span>
                            
                        </v-btn>
                        <v-btn
                        depressed
                        class="mx-2"
                        :disabled="poll.active"
                        @click="change(poll.id)">
                            <v-icon left>create</v-icon>
                            <span>Ändra</span>
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-btn
                        depressed
                        color="error"
                        :disabled="poll.active"
                        @click="remove(poll.id)">
                            <v-icon left>delete</v-icon>
                            <span>Radera</span>
                        </v-btn>
                    </v-row>
                    
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>
<script>
import PollCreator from './PollCreator';
import Results from './Results';

export default {
    name: 'PollManager',
    created() {
        this.$root.$data.socket.on('refreshPolls', this.refreshData);
        this.refreshData();
    },
    components: {
        PollCreator,
        Results,
    },
    data() {
        return {
            polls: [],
            resultDialog: false,
            openPanel: 0,
            result: {
                title: null,
                candidates: {}
            }
        }
    },
    methods: {
        activate(id) {
            const poll = this.findByID(id);
            if(poll.active === false) {
                this.$store.dispatch('activatePoll', poll.id)
                    .then((result) => {
                        this.$store.commit('alertClient', {
                            color: 'success',
                            text: result.msg,
                            timeout: 6 * 1000,
                            snackbar: true,
                            action: {
                                method: 'exit',
                                text: 'Ok'
                            }
                        })
                    })
                    .catch(error => {
                        if(error.status) {
                            this.$store.commit('alertClient', {
                                color: 'error',
                                text: error.msg,
                                timeout: 6 * 1000,
                                snackbar: true,
                                action: {
                                    method: 'exit',
                                    text: 'Ok'
                                }
                            });
                        }
                    })
            }
        },
        resetDialog() {
           this.$store.commit('newPoll', true);
        },
        showResult(id) {
            const poll = this.findByID(id);
            if(poll.active === true) {
                this.$store.dispatch('getResults', poll.id)
                    .then((data) => {
                        if(data.status === 'success') {
                            this.result = data.votes;
                            this.resultDialog = true;
                        }
                    })
                    .catch(error => {
                        if(error.status) {
                            this.$store.commit('alertClient', {
                                color: 'error',
                                text: error.msg,
                                timeout: 6 * 1000,
                                snackbar: true,
                                action: {
                                    method: 'exit',
                                    text: 'Ok'
                                }
                            });
                        }
                    })
            }
        },
        create() {
           this.$store.commit('newPoll', true);
           this.$store.commit('showPollCreator', true);
        },
        change(id) {
           const poll = this.findByID(id);
           this.$store.commit('pollID', id);
           this.$store.commit('newPoll', false);
           this.$store.commit('actions', 'Redigera omröstning');
           this.$store.commit('title', poll.title);
           this.$store.commit('candidates', poll.candidates);
           this.$store.commit('showPollCreator', true);
        },
        remove(id) {
            const poll = this.findByID(id);
            if(!poll.active) {
                this.$store.dispatch('removePoll', poll.id)
                    .then(data => {
                        this.$store.commit('alertClient', {
                                color: 'success',
                                text: data.msg,
                                timeout: 6 * 1000,
                                snackbar: true,
                                action: {
                                    method: 'exit',
                                    text: 'Ok'
                                }
                            });
                    })
                    .catch(error => {
                        if(error.status) {
                            this.$store.commit('alertClient', {
                                color: 'error',
                                text: error.msg,
                                timeout: 6 * 1000,
                                snackbar: true,
                                action: {
                                    method: 'exit',
                                    text: 'Ok'
                                }
                            });
                        }
                    })
            }
        },
        findByID(id) {
            return this.polls.find(poll => poll.id === id);
        },
        refreshData() {
            this.$store.dispatch('getPolls')
                .then(result => {
                    if(result.status === 'success') {
                        console.log('this actually happened..');
                        this.polls = result.polls;
                        
                    }
                })
                .catch(() => {
                    //
                })
        }
    },
}
</script>