<template>
    <div>
        <v-hover
        v-slot:default="{ hover }"
        open-delay="200"
        >
            <v-card
            :elevation="hover ? 16 : 2"
            class="mx-auto text-center"
            height="350"
            max-width="350"
            >
                <v-card-text class="font-weight-medium mt-12 text-center subtitle-1 ">
                    Antal inloggade
                </v-card-text>
                    <p class="mx-auto"> Inloggade just nu: {{ signedIn }} </p>
                    <v-progress-circular
                    :rotate="-90"
                    :size="200"
                    :width="30"
                    :value="getShare()"
                    color="teal"
                    >
                        {{ getShare() }}%
                    </v-progress-circular><br/>
                    <p class="mx-auto"> Andel av de närvarande som loggat in </p>
            </v-card>
        </v-hover>
    </div>
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
            return this.signedIn / this.validated * 100;
        },
        refreshData() {
            console.log("refresh")
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
