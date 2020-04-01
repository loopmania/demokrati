<template>
    <v-dialog
    v-model="show"
    max-width="700px">
        <v-card
        flat>
            <v-card-title>
                Resultat för {{result.title}}
            </v-card-title>
            <v-card-text
            class="mt-3">
                <v-container
                fill-height
                class="justify-center"
                >
                    <v-row
                    justify="center">
                        <v-col
                        v-for="(data, candidate) in result.candidates"
                        :key="candidate">
                            <v-card
                            flat
                            dark
                            min-width="180px"
                            height="130px"
                            >
                                <v-card-title
                                class="text-capitalize">
                                    {{candidate}}
                                </v-card-title>
                                <v-card-text>
                                    <v-progress-linear
                                    :value="data.percentage"
                                    class="mb-5"></v-progress-linear>
                                    <v-icon left>poll</v-icon>
                                    <span>{{data.votes}}st</span>
                                    <v-icon left
                                    class="ml-2">data_usage</v-icon>
                                    <span>{{data.percentage}}%</span>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-btn text
                @click="close">
                    Stäng
                </v-btn>
            </v-card-actions>
        </v-card>
        
    </v-dialog>
</template>
<script>
export default {
    name: 'Results',
    props: ['result','visible'],
    computed: {
        show: {
            get() {
                return this.visible;
            },
            set(value) {
                if(!value) {
                    this.$emit('close');
                }
            }
        }
    },
    methods: {
        close() {
            this.$emit('close');
        },
    }
}
</script>