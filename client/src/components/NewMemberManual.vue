<template>
    <v-dialog
    max-width="600px"
    v-model="dialog">
        <template
        v-slot:activator="{ on }">
            <v-btn
            text
            class="success"
            v-on="on">
                <span>Lägg till manuellt</span>
            </v-btn>
        </template>
        <v-card>
            <v-card-title>
                Lägg till en ny medlem manuellt
            </v-card-title>
            <v-card-text>
                <v-form
                class="px-3">
                    <v-text-field
                    label="Namn"
                    v-model="member.name"
                    :error-messages="nameErrors"
                    required/>
                    <v-text-field
                    label="KTH-email"
                    v-model="member.email"
                    :error-messages="emailErrors"
                    required/>
                    <v-btn
                    text
                    class="success mt-2"
                    @click.prevent="submit()">
                        Lägg till
                    </v-btn>
                    <v-btn
                    text
                    class="mt-2"
                    @click="dialog = false">
                        Avbryt
                    </v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

export default {
    mixins: [validationMixin],

    validations: {
        member: {
            name: {
                required,
            },
            email: {
                required,
            },
        },
    },
    computed: {
        nameErrors() {
            const errors = []
            if (!this.$v.member.name.$dirty) {
                return errors;
            }
            !this.$v.poll.member.name && errors.push('ett namn krävs');
            return errors;
        },
    },
    data: () => ({
            member: {
                name: '',
                email: ''
            },
            dialog: false
    }),
    ,
    methods: {
        submit() {
            this.$store.dispatch('addValidMember', this.member)
                .then(() => {
                    this.member.name = '';
                    this.member.email = '';
                    this.dialog = false;
                })
                .catch(error => {
                    // alertClient
                    console.log(error);
                })
        },
    },
}
</script>
