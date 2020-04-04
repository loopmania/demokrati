<template>
    <v-dialog
    max-width="600px"
    v-model="dialog">
        <template
        v-slot:activator="{ on }">
            <v-btn
            text
            class="success ma-3"
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
                    label="KTH-email"
                    placeholder="namn@kth.se"
                    filled
                    v-model="member.email"
                    :rules='emailRules'
                    required
                    />
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
import { required, email } from 'vuelidate/lib/validators'

export default {
    mixins: [validationMixin],

    validations: {
        formStepper: {
            email: {
                required,
                email,
            }
        }
    },
    computed: {
        members: {
            get(){
                return this.$store.getters.members;
            }
        }
    },
    data: () => ({
            member: {
                email: ''
            },
            dialog: false,
            emailRules: [
                v => !!v || "En KTH-email krävs",
                v => /.+@kth\.se$/.test(v) || "Måste vara en riktig KTH-email"
            ],
    }),
    methods: {
        submit() {
            let ths_emails = this.members.map(({ email }) => email);
            if (ths_emails.includes(this.member.email)){
                this.$store.commit('alertClient', {
                    color: 'error',
                    text: 'Personen du försöker lägga till finns redan i listan av THS-medlemmar.',
                    timeout: 6000,
                    snackbar: true,
                    action: {
                        method: 'exit',
                        text: 'Stäng'
                    }
                });
                return
            }
            this.$store.dispatch('addNewMember', this.member)
                .then(() => {
                    this.member.email = '';
                    this.dialog = false;
                })
                .catch(error => {
                    // alertClient
                    this.member.email = '';
                    console.log(error);
                })
        },
    },
}
</script>
