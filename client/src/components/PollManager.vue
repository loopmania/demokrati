<template>
    <div>
        PollManager
        <NewPoll/>
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
                        v-if="!poll.active">
                            <v-icon left>launch</v-icon>
                            <span>Aktivera</span>
                        </v-btn>
                        <v-btn
                        depressed
                        class="mx-2"
                        color="secondary"
                        v-else>
                            <v-icon left>launch</v-icon>
                            <span>Avsluta</span>
                            
                        </v-btn>
                        <v-btn
                        depressed
                        class="mx-2"
                        :disabled="poll.active">
                            <v-icon left>create</v-icon>
                            <span>Ändra</span>
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-btn
                        depressed
                        color="error"
                        :disabled="poll.active">
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

export default {
    name: 'PollManager',
    created() {
        this.$root.$data.socket.on('refreshPolls', this.refreshData);
        this.refreshData();
    },
    components: {
        NewPoll
    },
    data() {
        return {
            polls: [],
            panel: null
        }
    },
    methods: {
        refreshData() {
            this.$store.dispatch('getPolls')
                .then(result => {
                    if(result.status === 'success') {
                        this.polls = result.polls
                        this.polls.forEach(poll => {
                            if(poll.active === true) {
                                this.panel = poll.id + 1;
                            }
                        });
                    }
                })
                .catch(() => {
                    //
                })
        }
    },
}
</script>