<template>
    <div>
        PollManager
        <NewPoll/>
        <Results
        :visible="resultDialog"
        :result="result"
        @close="resultDialog = false"/>
        <v-expansion-panels
        class="py-8"
        accordion
        v-model="panel">
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
import NewPoll from './NewPoll';
import Results from './Results';

export default {
    name: 'PollManager',
    created() {
        this.$root.$data.socket.on('refreshPolls', this.refreshData);
        this.refreshData();
    },
    components: {
        NewPoll,
        Results
    },
    data() {
        return {
            polls: [],
            panel: null,
            resultDialog: false,
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
                            this.getActive();
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
        showResult(id) {
            const poll = this.findByID(id);
            if(poll.active === true) {
                this.$store.dispatch('getResults', poll.id)
                    .then((data) => {
                        if(data.status === 'success') {
                            this.result = data.votes;
                            console.log(this.result);
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
        change(id) {
            console.log(id);
        },
        remove(id) {
            console.log(id);
        },
        findByID(id) {
            return this.polls.find(poll => poll.id === id);
        },
        getActive() {
            const poll = this.polls.findIndex(poll => poll.active === true);
            this.panel = poll;
            return poll;
        },
        refreshData() {
            this.$store.dispatch('getPolls')
                .then(result => {
                    if(result.status === 'success') {
                        this.polls = result.polls;
                        this.getActive();
                        
                    }
                })
                .catch(() => {
                    //
                })
        }
    },
}
</script>