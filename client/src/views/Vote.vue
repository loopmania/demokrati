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
                    Väntar på sluten votering
                </span>
                <span
                v-else-if="waiting === false && voted === false && title !== null">
                    Val av {{title}}
                </span>
                <span
                v-else>
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
                            @click="save">
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
    created() {
        this.findVote();
        this.$root.$data.socket.on('invokePoll', this.findVote);
        this.$root.$data.socket.on('inactivate', this.resetVote);
    },
    data() {
        return {
            waiting: true,
            voted: false,
            selection: null,
            title: null,
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
            }, 1500);
        },
        save() {
            this.$store.dispatch('vote', {
                candidateId: this.$data.selection,
                pollId: this.id
            })
            
            this.hasVoted();
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
                    if(data.statusCode === 13) {
                        this.waiting = true;
                        this.resetVote();
                    } else {
                        this.waiting = false;
                        this.title = data.vote.title;
                        this.id = data.vote.id;
                        this.candidates = data.vote.candidates;
                        this.voted = data.voted
                    }
                })
                .catch(error => {
                    console.log(error);
                    if(error.voted) {
                        this.waiting = false;
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