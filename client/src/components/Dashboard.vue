<template>
    <div>
        <v-card
        flat
        max-width="80%"
        fill-height
        class="mx-auto">
            <v-container>
                <v-row
                >
                    <v-col
                    class="d-flex align-stretch">
                        <SignedIn/>
                    </v-col>
                    <v-col
                    class="d-flex align-stretch">
                        <activePoll/>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col
                    class="d-flex align-stretch">
                        <!-- Misc funktioner -->
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </div>
</template>
<script>
import activePoll from './activePoll';
import SignedIn from './SignedIn';
export default {
    name: 'Dashboard',
    components: {
        SignedIn,
        activePoll
    }
}
</script>
