<template>
    <v-hover
    v-slot:default="{ hover }"
    open-delay="200"
    >
        <v-card
        :elevation="hover ? 16 : 2"
        class="mx-auto"
        height="350"
        width="350"
        >
            <v-card-title>
                Aktiv omröstning: {{title}}
            </v-card-title>
            <v-card-subtitle>
                Andelen som hitills har röstat
            </v-card-subtitle>
            <v-card-text class="font-weight-medium mt-4 text-center">
                <v-progress-circular
                :rotate="-90"
                :size="200"
                :width="30"
                :value="value"
                color="teal"
                >
                    {{ value }}%
                </v-progress-circular>
            </v-card-text>
        </v-card>
    </v-hover>
</template>
<script>
export default {
    created() {
        this.$root.$data.socket.on('updatePoll', this.update);
        this.update();
    },
    data() {
        return {
            value: 0,
            title: ''
        }
    },
    methods: {
        update() {
            console.log('refrsh');
            this.$store.dispatch('getHasVoted')
                .then(result => {
                    this.title = result.title;
                    result.count.forEach(({hasVoted, percentage}) => {
                        if(hasVoted) {
                            this.value = percentage;
                        }
                    })
                })
                .catch(() => {
                    this.title = 'Saknas'
                })

        }
    }
}
</script>