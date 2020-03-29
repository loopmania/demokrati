<template>
    <div>
        Admin
        <v-card>
            <v-tabs
            grow>
                <v-tab>Dashboard</v-tab>
                <v-tab>Omröstningar</v-tab>
                <v-tab>Medlemmar</v-tab>
                <v-tab-item>
                    <Dashboard/>
                </v-tab-item>
                <v-tab-item>
                    <PollManager/>
                </v-tab-item>
                <v-tab-item>
                    <MemberManager/>
                </v-tab-item>
            </v-tabs>
        </v-card>
    </div>
</template>
<script>
import Dashboard from '../components/Dashboard';
import PollManager from '../components/PollManager';
import MemberManager from '../components/MemberManager';

export default {
    components: {
        Dashboard,
        PollManager,
        MemberManager
    },
};
</script>