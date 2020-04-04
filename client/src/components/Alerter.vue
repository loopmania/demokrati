<template>
    <v-snackbar
        v-model="alertError.snackbar"
        top
        :color="alertError.color"
        :timeout="alertError.timeout">
            {{alertError.text}}
            <v-btn
            dark
            text
            @click="buttonAction()">
                {{alertError.action.text}}
            </v-btn>
    </v-snackbar>
</template>
<script>
export default {
    name: 'Alerter',
    computed: {
        alertError() {
            const instructions = this.$store.getters.alertError;
            return instructions;
        },
    },
    data() {
        return {
            snackbar: false,
            
        }
    },
    methods: {
        buttonAction() {
            const method = this.alertError.action.method;
            if(method === 'exit') {
                //
            }
            if(method === 'update') {
                const timer = this.alertError.action.timer;
                clearTimeout(timer);
                this.$store.dispatch('findMe');
            }
            this.alertError.snackbar = false;
        }
    },
    created() {
        //
    }
};
</script>