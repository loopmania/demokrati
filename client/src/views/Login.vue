<template>
    <div>
        <v-card flat>
            <v-card-title>
                <h2>Logga in</h2>
            </v-card-title>
            <v-card-text>
                <v-stepper
                v-model="formStepper.step"
                vertical>
                    <v-stepper-step
                    :complete="formStepper.step > 1"
                    step="1">
                    <small>Ange din KTH-email</small>
                    </v-stepper-step>
                    <v-stepper-content step="1">
                        <v-text-field
                            label="KTH-email"
                            placeholder="namn@kth.se"
                            filled
                            v-model="formStepper.email"
                            :error-messages="emailErrors"
                            required
                            @input="$v.formStepper.email.$touch()"
                            @blur="$v.formStepper.email.$touch()">

                        </v-text-field>

                        <v-btn color="primary" @click="activateMail()">Fortsätt</v-btn>
                        <v-btn text @click="abort()">Avbryt</v-btn>
                    </v-stepper-content>
                    <v-stepper-step
                    :complete="formStepper.step > 2"
                    step="2">
                    <small>Verifiera din email</small>
                    </v-stepper-step>
                    <v-stepper-content step="2">
                        <p>
                            Vi har skickat en temporär inloggningskod
                            till din email.
                        </p>
                        <v-text-field
                            label="Inloggningskod"
                            placeholder="Klistra in koden"
                            filled
                            v-model="formStepper.code"
                            :error-messages="codeErrors"
                            required
                            @input="$v.formStepper.code.$touch()"
                            @blur="$v.formStepper.code.$touch()">>
                        </v-text-field>
                        <v-btn color="primary" @click="verifyMail()">Verifiera</v-btn>
                        <v-btn text @click="abort()">Avbryt</v-btn>
                    </v-stepper-content>
                </v-stepper>
            </v-card-text>
        </v-card>
    </div>
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
            },
            code: {
                required,
                code: (value) => {
                    return /^([A-Z]{4}-?){4}$/.test(value);
                }
            }
        }

    },
    data() {
        return {
            formStepper: {
                step: 1,
                email: null,
                code: null,
            }
        }
    },
    methods: {
        abort() {
            this.$store.commit('invalidateLogin');
            this.formStepper.step = 1;
            this.formStepper.email = '';
            this.formStepper.code = '';
        },
        activateMail() {
            if(!this.$v.formStepper.$anyError && this.formStepper.email !== null) {
                this.$store.dispatch('activate', this.formStepper)
                    .then(status => {

                        if(status === 'success') {
                            this.formStepper.step = 2;
                        }
                    })
                    .catch(error => {
                        this.$store.commit('alertClient', {
                            color: error.color,
                            text: error.text,
                            timeout: 6000,
                            snackbar: true,
                            action: {
                                method: 'exit',
                                text: 'Stäng'
                            }
                        });

                    });
            } else {
                this.$v.formStepper.email.$touch();
            }
        },
        verifyMail() {
            const activated = this.$store.getters.hasActivated;
            if(this.formStepper.step === 2 && activated && !this.$v.formStepper.$anyError && this.formStepper.code !== null) {
                this.$store.dispatch('verify', this.formStepper)
                    .then(result => {
                        if(result.status === 'success' && result.user !== undefined) {
                            this.$root.$data.socket.emit('join', 'sm');
                            if(result.user.admin) {
                                this.$root.$data.socket.emit('join', 'admin');
                            }
                            this.$router.push({ name: 'Vote'});
                        }
                    })
                    .catch(error => {
                        this.$store.commit('alertClient', {
                            color: error.color,
                            text: error.text,
                            timeout: 6000,
                            snackbar: true,
                            action: {
                                method: 'exit',
                                text: 'Stäng'
                            }
                        });
                    });
            } else {
                this.$v.formStepper.code.$touch();
            }
        }
    },
    computed: {
        emailErrors() {
            const errors = []
            if (!this.$v.formStepper.email.$dirty) {
                return errors;
            }
            !this.$v.formStepper.email.email && errors.push('Måste vara en riktig KTH-email');
            !this.$v.formStepper.email.required && errors.push('En KTH-email krävs');
            return errors;
        },
        codeErrors() {
            const errors = []
            if (!this.$v.formStepper.code.$dirty) {
                return errors;
            }
            !this.$v.formStepper.code.code && errors.push('Koden är på fel format.');
            !this.$v.formStepper.code.required && errors.push('Du behöver en kod från din KTH-email');
            return errors;
        }

    },
}
</script>
