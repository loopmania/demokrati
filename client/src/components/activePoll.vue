<template>
    <v-card>
        <v-card-title>
            Aktiv omröstning
        </v-card-title>
        <v-card-text>
            <v-progress-circular
            rotate="-90"
            size="144"
            :value="value"
            width="10">
                {{value}}
            </v-progress-circular>
        </v-card-text>
    </v-card>
</template>
<script>
export default {
    created() {
        //this.$root.$data.$socket.on('updatePoll', this.update());
        //this.update();
    },
    data() {
        return {
            value: 72
        }
    },
    methods: {
        /*update() {
            this.$store.dispatch('getHasVoted')
                .then(result => {

                })

        }*/
    }
}
</script>