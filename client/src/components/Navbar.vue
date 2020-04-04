<template>
    <nav>
        <v-app-bar flat app>
            <v-app-bar-nav-icon
            class="grey--text"
            @click.stop="drawer = !drawer">
            <v-icon>menu</v-icon>
            </v-app-bar-nav-icon>
            <v-toolbar-title class="text-uppercase grey--text">
                <span class="font-weight-light">Demokrat</span>
                <span>i</span>
            </v-toolbar-title>
            <v-spacer/>
            <v-btn
            text
            v-if="!loggedIn"
            router to="/login"
            class="d-none d-sm-flex">
                <v-icon left>input</v-icon>
                <span>Logga in</span>
            </v-btn>
            <v-btn
            text
            v-if="loggedIn"
            router to="/logout"
            class="d-none d-sm-flex">
                <v-icon left>output</v-icon>
                <span>Logga ut</span>
            </v-btn>
        </v-app-bar>
        <v-navigation-drawer
        v-model="drawer"
        class="primary"
        app
        width="300">
            <v-list>
                <v-list-item
                v-for="item in items"
                :key="item.title"
                link
                router :to="item.route"
                nav
                tile="false">
                <v-list-item-icon>
                    <v-icon
                    class="white--text">
                        {{item.icon}}
                    </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title
                        class="white--text">
                            {{ item.title }}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-group
                color="white"
                group>
                    <template
                    v-slot:activator>
                    <v-list-item-icon
                    class="white--text">
                         <v-icon>
                            lock
                         </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        
                        <v-list-item-title
                        class="white--text">
                            Admin
                        </v-list-item-title>
                    </v-list-item-content>
                    </template>

                    <v-list-item
                    v-for="item in adminItems"
                    :key="item.title"
                    link
                    router :to="item.route">
                        <v-list-item-title
                        class="white--text text-center">
                            {{item.title}}
                        </v-list-item-title>
                    </v-list-item>
                </v-list-group>
            </v-list>
            <template
            v-slot:append>
                <div class="pa-2">
                    <v-btn
                    block
                    v-if="loggedIn"
                    router to="/logout">
                        Logga ut
                    </v-btn>
                    <v-btn
                    block
                    v-if="!loggedIn"
                    router to="/login">
                        Logga in
                    </v-btn>
                </div>
            </template>
        </v-navigation-drawer>
    </nav>
</template>

<script>

export default {
    name: 'Navbar',
    computed: {
        loggedIn() {
            return this.$store.getters.loggedIn;
        },
    },
    data() {
        return {
            drawer: false,
            items: [
                {
                    title: 'Omröstning',
                    icon: 'gavel',
                    route: '/vote'
                },
                {
                    title: 'Handlingar',
                    icon: 'schedule',
                    route: '/'
                },
            ],
            adminItems: [
                {
                    title: 'Dashboard',
                    icon: '',
                    route: '/dashboard'
                },
                {
                    title: 'Omröstningar',
                    icon: '',
                    route: '/polls'
                },
                {
                    title: 'Medlemmar',
                    icon: '',
                    route: '/members'
                }
            ]
        }
    }
};
</script>