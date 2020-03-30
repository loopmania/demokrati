<template>
    <div>
        <v-card max-width="80%" class="ma-auto" >
            <v-card-title class="font-weight-light">
                Lägg till ny medlem
                <v-spacer></v-spacer>
            </v-card-title>
            <v-autocomplete
                v-model="newMember"
                class="d-inline-flex mx-auto pa-md-4"
                width="400px"
                :items="ths_members"
                item-text="name"
                dense
                label="Namn"
            ></v-autocomplete>
            <v-btn
                text
                class="success"
                v-on="on">
                <span>Lägg till</span>
            </v-btn>
        </v-card>
        <v-card max-width="80%" class="mx-auto">
            <v-card-title class="font-weight-light">
                Validerade Medlemmar
                <v-spacer></v-spacer>
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                ></v-text-field>
            </v-card-title>
            <v-data-table
            :headers="headers"
            :items="valid_members"
            :search="search"
            >
            <template v-slot:item="row">
                <tr :class="getColor(row.item.signedIn)">
                  <td>{{row.item.name}}</td>
                  <td>{{row.item.email}}</td>
                  <td>
                      <v-icon color="red darken-1" @click="invalidateMember(row.item)">directions_walk</v-icon>
                  </td>
                </tr>
                </template>

            </v-data-table>

        </v-card>
    </div>
</template>
<script>
//import NewMemberManual from './NewMemberManual';
export default {
    name: 'MemberManager',
    /*components: {
        NewMemberManual
    },*/
    data () {
        return{
            search: '',
            headers: [{text: 'Namn',
                    align: 'start',
                    sortable: false,
                    value: 'name'},
                    {text: 'KTH-email',
                    value: 'email'},
                    {text: 'Invalidera',
                    value: 'actions'}],
            valid_members: [{name: 'Sandra Järkeborn', //byt ut till listan av faktiska medlemmar
                            email: 'jark@kth.se',
                            signedIn: true},
                            {name: 'John Landeholt',
                            email: 'johnlan@kth.se',
                            signedIn: false}],
            ths_members: [{name: 'Anna Saibel', //byt ut till listan av faktiska medlemmar
                            email: 'saibel@kth.se', // searchname/concatinate
                            signedIn: "false"},
                            {name: 'Vera Werner',
                            email: 'vwerner@kth.se',
                            signedIn: "false"}],
            rowClass: ({ item }) => this.getColor(item.signedIn)

        };
    },
    methods: {
    getColor(signedIn){
            if (signedIn === true) return "green lighten-5";
            else return "white";
        },
    invalidateMember(member){
        return member
    }
    }
}
</script>
