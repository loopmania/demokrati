<template>
    <div>
        <v-tabs
        fill-height
        centered
        >
            <v-tab
            :to="{ path: '/dashboard'}">
            Dashboard
            </v-tab>
            <v-tab
            :to="{ path: '/polls'}"
            >
            Omröstningar
            </v-tab>
            <v-tab
            :to="{ path: '/members'}"
            >
            Medlemmar
            </v-tab>
            
        </v-tabs>
        <router-view></router-view>
    </div>
</template>
<script>
//import Dashboard from '../components/Dashboard';
//import PollManager from '../components/PollManager';
//import MemberManager from '../components/MemberManager';

export default {
    /*components: {
        Dashboard,
        PollManager,
        MemberManager
    },*/
};
</script>