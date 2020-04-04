<template>
    <v-dialog
    max-width="600px"
    v-model="show">
        <v-card>
            <v-card-title>
                {{action}}
            </v-card-title>
            <v-card-text>
                <v-form
                class="px-3"
                ref="form">
                    <v-text-field
                    label="titel"
                    placeholder="Är det mötets mening att välja X som Y?"
                    v-model="title"
                    :rules="titleRules"
                    required/>
                    <v-combobox
                    label="Ange röstmöjligheter"
                    v-model="candidates"
                    :rules="candidateRules"
                    :filter="filter"
                    :hide-no-data="!search"
                    :items="items"
                    :search-input.sync="search"
                    required
                    deletable-chips
                    multiple
                    small-chips
                    hide-selected
                    ref="candidateData">
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
                    v-if="newPoll"
                    :loading="loading"
                    @click.prevent="create">
                        Skapa
                    </v-btn>
                    <v-btn
                    text
                    class="success mt-2"
                    v-else
                    :loading="loading"
                    @click.prevent="change">
                        Spara
                    </v-btn>
                    <v-btn
                    text
                    class="mt-2"
                    @click.prevent="close">
                        Avbryt
                    </v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
export default {
    watch: {
        candidates(val, prev) {
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
    computed: {
        action() {
            return this.$store.getters.actions;
        },
        id() {
            return this.$store.getters.pollid;
        },
        title: {
            get() {
                return this.$store.getters.title;
            },
            set(value) {
                this.$store.commit('title', value);
            }
        },
        candidates: {
            get() {
                return this.$store.getters.candidates;
            },
            set(value) {
                value.forEach(v => {
                    if(!v.text) {
                        this.$store.commit('addCandidate', v);
                    }
                })
            }
            
        },
        show: {
            get() {
                return this.$store.getters.showPollCreator;
            },
            set(value) {
                if(!value) {
                    this.close();
                }
            }
        },
        newPoll() {
            return this.$store.getters.newPoll;
        }
    },
    data() {
        return {
            titleRules: [
                v => v.length >= 6 || 'En utförlig titel krävs'
            ],
            candidateRules: [
                v => v.length >= 2 || 'Det krävs minst 2 röstmöjligheter',
                v => v.some(obj => { return obj.text.toLowerCase() === 'blankt' })|| 'Röstmöjligheten Blankt måste vara med',
                v => v.some(obj => { return obj.text.toLowerCase() === 'avslag' })|| 'Röstmöjligheten Avslag måste vara med',
                
            ],
            titleData: '',
            model: [
                {
                    text: 'Blankt'
                },
                {
                    text: 'Avslag'
                }
            ],
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
            index: -1,
            search: null,
            menu: false,
            attach: null,
            loading: false
        }
    },
    methods: {
        close() {
            this.$store.commit('showPollCreator', false);
            this.$emit('close');
            this.$refs.form.resetValidation();
        },
        create() {
            if(this.$refs.form.validate()) {
                this.loading = true;
                const poll = {
                    title: this.title,
                    candidates: this.$refs.candidateData.selectedValues
                }
                this.$store.dispatch('createPoll', poll)
                    .then(result => {
                        this.$store.commit('alertClient', {
                            color: 'success',
                            text: result.msg,
                            timeout: 6 * 1000,
                            snackbar: true,
                            action: {
                                method: 'exit',
                                text: 'Ok'
                            }
                        });
                        this.loading = false;
                        this.close();
                    })
                    .catch(error => {
                        if(error.status) {
                            this.$store.commit('alertClient', {
                                color: 'error',
                                text: error.msg,
                                timeout: 6 * 1000,
                                snackbar: true,
                                action: {
                                    method: 'exit',
                                    text: 'Ok'
                                }
                            });
                        }
                        this.loading = false;
                    })
                
            }
        },
        change() {
            if(this.$refs.form.validate()) {
                this.loading = true;
                const poll = {
                    id: this.id,
                    title: this.title,
                    candidates: this.$refs.candidateData.selectedValues
                };
                this.$store.dispatch('editPoll', poll)
                    .then(result => {
                        this.$store.commit('alertClient', {
                            color: 'success',
                            text: result.msg,
                            timeout: 6 * 1000,
                            snackbar: true,
                            action: {
                                method: 'exit',
                                text: 'Ok'
                            }
                        });
                        this.loading = false;
                        this.close();
                    })
                    .catch(error => {
                        this.$store.commit('alertClient', {
                            color: 'error',
                            text: error.msg,
                            timeout: 6 * 1000,
                            snackbar: true,
                            action: {
                                method: 'exit',
                                text: 'Ok'
                            }
                        });
                        this.loading = false;
                    })
                
            }
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
    }
}
</script>