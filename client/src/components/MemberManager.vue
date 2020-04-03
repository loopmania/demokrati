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
                item-text="email"
                dense
                label="Namn"
            ></v-autocomplete>
            <v-btn
                text
                class="success"
                @click="validateMember()">
                <span>Lägg till</span>
            </v-btn>
            <MemberCreator
            :activator="memberDialog"
            :memberdata="NewMemberManual"
            @close="resetDialog"/>
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
                      <v-btn @click="invalidateMember(row.item)">
                          Ta bort
                          <v-icon color="red darken-1" @click="invalidateMember(row.item)">directions_walk</v-icon>
                      </v-btn>
                  </td>
                </tr>
                </template>

            </v-data-table>

        </v-card>
    </div>
</template>
<script>
import MemberCreator from './MemberCreator';
export default {
    name: 'MemberManager',
    components: {
        MemberCreator
    },
    created() {
        this.$root.$data.socket.on('refreshMembers', this.refreshData);
        this.refreshData();
    },
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
            valid_members: [],
            ths_members: [],
            newMember: null,
            NewMemberManual: {
                name: '',
            },
            memberDialog: false,

        };
    },
    methods: {
        getColor(signedIn){
            if (signedIn === true) return "green lighten-5";
            else return "white";
        },
        resetDialog() {
            this.memberDialog = false;
            console.log(this.NewMemberManual);
        },
        invalidateMember(member){
            console.log("invalidate")
            console.log(member)
            this.$store.dispatch('invalidateMember', member)
                .then(result => {
                    console.log(result);
                })
                .catch(error => {
                    console.log(error);
                })
        },
        validateMember(){
            console.log("validate")
            // Currently this.newMember will only be the email.
            // Necessary changes will have to be in place here

            //const email = this.newMember.split('(')[1]; // extract email from format "Name (email)"
            //email = email.replace(")", "");
            this.$store.dispatch('validateMember', this.newMember)
                .then(() => {
                    this.newMember = '';
                })
                .catch(error => {
                    // alertClient
                    this.newMember = '';
                    console.log(error);
                })
        },
        refreshData() {
            console.log("refresh")
            this.$store.dispatch('getInvalidMembers')
                .then(result => {
                    if(result.status === 'success') {
                        this.ths_members = result.members;
                        console.log(this.ths_members);
                    }
                })
                .catch(() => {
                    //
                });
            this.$store.dispatch('getValidMembers')
                    .then(result => {
                        if(result.status === 'success') {
                            this.valid_members = result.members;
                            console.log(this.valid_members);
                        }
                    })
                    .catch(() => {
                        //
                    });
        }
    }
}
</script>
