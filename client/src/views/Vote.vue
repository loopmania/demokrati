<template>
    <div>
        Vote
        <v-card
        :loading="waiting"
        class="mx-auto my-12"
        max-width="350">
            <v-card-title>
                <span
                v-if="waiting === true && voted === false">
                    Väntar på ny sluten votering
                </span>
                <span
                v-else-if="waiting === false && voted === false && title !== null">
                    {{title}}
                </span>
                <span
                v-else-if="alreadyVoted === true">
                    Du har redan röstat på {{oldTitle}}
                </span>
                <span
                v-else-if="voted === true">
                    Tack för din röst!
                </span>
            </v-card-title>
            <v-card-text>
                <v-expand-transition>
                    <v-card
                    flat
                    v-show="candidates.length > 0">
                        <span class="subheading">
                            Alternativ
                        </span>
                        <v-chip-group
                        v-model="selection">
                            <v-chip
                            v-for="candidate in candidates"
                            :key="candidate"
                            @click="save(candidate)">
                                {{candidate}}
                            </v-chip>
                        </v-chip-group>
                    </v-card>
                </v-expand-transition>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>
export default {
    beforeDestroy() {
        //this.$root.$data.socket.removeListener('invokePoll');
    },
    created() {
        this.findVote();
        this.$root.$data.socket.on('invokePoll', this.findVote);
        this.$root.$data.socket.on('inactivate', this.inactivateVote);
    },
    data() {
        return {
            waiting: false,
            voted: false,
            alreadyVoted: false,
            selection: null,
            title: null,
            oldTitle: null,
            id: null,
            candidates: []
        }
    },
    methods: {
        hasVoted() {
            this.voted = true;
            this.resetVote();
            setTimeout(() => {
                this.voted = false;
                this.waiting = true;
            }, 2500);
        },
        save(candidate) {
            if(candidate !== undefined && this.id !== undefined) {
                this.$store.dispatch('vote', {
                    candidate: this.candidates.indexOf(candidate),
                    poll: this.id
                })
                    .then(() => {
                        this.hasVoted();
                    })
                    .catch(error => {
                        if(error.code) {
                            if(error.voted) {
                                this.oldTitle = error.title;
                                this.alreadyVoted = true;
                                this.hasVoted();
                            } else {
                                this.waiting = true;
                                this.resetVote();
                            }
                            this.$store.commit('alertClient', {
                                color: 'error',
                                text: error.msg,
                                timeout: 6 * 1000,
                                snackbar: true,
                                action: {
                                    method: 'exit',
                                    text: 'Ok'
                                }
                            })
                        }
                    });
            } else {
                console.log('fuck');
            }
            
        },
        inactivateVote() {
            this.waiting = true;
            this.voted = false;
            this.resetVote();

        },
        resetVote() {
            this.title = null;
            this.id = null,
            this.candidates = [];
        },
        findVote() {
            console.log('looking for vote');
            this.$store.dispatch('findVote')
                .then(data => {
                    
                    if(data.code === 13) {
                        this.waiting = true;
                        this.resetVote();
                    } else {
                        this.waiting = false;
                        this.alreadyVoted = false;
                        this.title = data.vote.title;
                        this.id = data.vote.id;
                        this.candidates = data.vote.candidates;
                        this.voted = data.voted
                    }
                })
                .catch(error => {
                    console.log(error);
                    if(error.voted) {
                        this.oldTitle = error.title;
                        this.alreadyVoted = true;
                        this.hasVoted();
                    } else {
                        this.waiting = true;
                        this.resetVote();
                    }
                });
        }
    }
}
</script>