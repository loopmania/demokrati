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
                <span>Ny omröstning</span>
            </v-btn>
        </template>
        <v-card>
            <v-card-title>
                Lägg till en ny omröstning
            </v-card-title>
            <v-card-text>
                <v-form
                class="px-3">
                    <v-text-field
                    label="titel"
                    placeholder="Är det mötets mening att välja X som Y?"
                    v-model="poll.title"
                    :error-messages="titleErrors"
                    required
                    @input="$v.poll.title.$touch()"
                    @blur="$v.poll.title.$touch()"/>
                    <v-combobox
                    v-model="model"
                    :filter="filter"
                    :hide-no-data="!search"
                    :items="items"
                    :search-input.sync="search"
                    hide-selected
                    label="Ange röstmöjligheter"
                    deletable-chips
                    multiple
                    small-chips
                    :error-messages="candidateErrors"
                    required
                    @input="$v.model.$touch()"
                    @blur="$v.model.$touch()">
                        <template v-slot:no-data>
                            <v-list-item>
                            <span class="subheading mr-2">Skapa</span>
                            <v-chip
                                label
                                small
                            >
                                {{ search }}
                            </v-chip>
                            </v-list-item>
                        </template>
                        <template v-slot:selection="{ attrs, item, parent, selected }">
                            <v-chip
                            v-if="item === Object(item)"
                            v-bind="attrs"
                            :input-value="selected"
                            label
                            deletable-chips
                            small>
                                <span class="pr-2">
                                    {{ item.text }}
                                </span>
                                <v-icon
                                small
                                @click="parent.selectItem(item)">
                                    close
                                </v-icon>
                            </v-chip>
                        </template>
                    </v-combobox>
                    <v-btn
                    text
                    class="success mt-2"
                    @click.prevent="submit()">
                        Skapa
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
        poll: {
            title: { 
                required,
            },
        },
        model: {
            required,
            candidates: (value) => {
                return value.length > 1;
            },
            blankt: (value) => {
                return value.some(obj => { return obj.text === 'Blankt'})
            }
        }
      
    },
    computed: {
        titleErrors() {
            const errors = []
            if (!this.$v.poll.title.$dirty) {
                return errors;
            }
            !this.$v.poll.title.required && errors.push('en titel krävs');
            return errors;
        },
        candidateErrors() {
            const errors = []
            if (!this.$v.model.$dirty) {
                return errors;
            }
            !this.$v.model.required && errors.push('Röstmöjligheter krävs');
            !this.$v.model.candidates && errors.push('Det krävs minst 2 röstmöjligheter');
            !this.$v.model.blankt && errors.push('Röstmöjligheten Blankt måste vara med');
            return errors;
        }
    },
    data: () => ({
            activator: null,
            attach: null,
            index: -1,
            items: [
                { 
                    header: 'Välj av alternativen, eller skriv egna' 
                },
                {
                    text: 'Avslag',
                },
                {
                    text: 'Bifalles',
                },
                {
                    text: 'Blankt',
                },
            ],
            nonce: 1,
            menu: false,
            model: [
                {
                text: 'Blankt',
                },
            ],
            x: 0,
            search: null,
            y: 0,
            poll: {
                title: '',
                candidates: []
            },
            dialog: false
    }),
    watch: {
        model(val, prev) {
            if (val.length === prev.length) return

            this.model = val.map(v => {
            if (typeof v === 'string') {
                v = {
                text: v,
                }
                this.items.push(v)
                this.nonce++
            }
            return v
        })
      },
    },
    methods: {
        submit() {
            this.model.forEach(candidate => this.poll.candidates.push(candidate.text));
            this.$store.dispatch('createPoll', this.poll)
                .then(() => {
                    this.poll.title = '';
                    this.model = [{ text: 'Blankt' }];
                    this.dialog = false;
                })
                .catch(error => {
                    // alertClient
                    this.poll.candidates = [];
                    console.log(error);
                })
        },
        filter(item, queryText, itemText) {
            if (item.header) return false

            const hasValue = val => val != null ? val : ''

            const text = hasValue(itemText)
            const query = hasValue(queryText)

            return text.toString()
            .toLowerCase()
            .indexOf(query.toString().toLowerCase()) > -1
        },
    },
}
</script>