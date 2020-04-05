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
        >   <v-card-title>
            Antal inloggade: {{signedIn}}st
            </v-card-title>
            <v-card-subtitle>
                Andelen närvarande som är inloggade
            </v-card-subtitle>
            <v-card-text class="font-weight-medium mt-4 text-center">

                <v-progress-circular
                :rotate="-90"
                :size="200"
                :width="30"
                :value="getShare()"
                color="teal"
                >
                    {{ getShare() }}%
                </v-progress-circular>
            </v-card-text>
        </v-card>
    </v-hover>
</template>
<script>
export default {
    name: 'signed_in',
    created() {
        this.$root.$data.socket.on('refreshMembers', this.refreshData);
        this.refreshData();
    },
    data () {
        return{
            signedIn: 0,
            validated: 0,
            share: 0
        };
    },
    methods: {
        getShare(){
            return Math.round(this.signedIn / this.validated * 100);
        },
        refreshData() {
            this.$store.dispatch('countSignedIn')
                .then(result => {
                    if(result.status === 'success') {
                        console.log(result)
                        this.signedIn = result.count;
                    }
                })
                .catch(() => {
                    //
                });

            this.$store.dispatch('countValidated')
                .then(result => {
                    if(result.status === 'success') {
                        this.validated = result.count;
                    }
                })
                .catch(() => {
                    //
                });
        }
    }

}
</script>
