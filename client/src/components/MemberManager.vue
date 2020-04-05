<template>
    <div>
        <v-card max-width="80%" class="mx-auto my-4" >
            <v-card-title class="font-weight-light">
                Lägg till ny medlem som närvarande
                <v-spacer></v-spacer>
            </v-card-title>
            <v-card-text>
                <p>
                    Sök på personens namn eller email. <br>
                    Finns den inte i listan måste kårmedlemskap kontrolleras manuellt, lägg sedan till personen manuellt.
                </p>
            </v-card-text>

            <v-autocomplete
                v-model="newMember"
                class="d-inline-flex mx-auto pa-md-4"
                width="400px"
                :items="ths_members"
                item-text="searchname"
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
                Närvarande medlemmar
                <v-spacer></v-spacer>
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Sök (namn eller mail)"
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
                <tr :class="getColor(row.item.signed_in)">
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
        <br/>
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
    computed: {
        easySearch() {
            return `${this.ths_members}`
        }
    },
    methods: {
        getColor(signedIn){
            if (signedIn === true) return "green lighten-5";
            else return "white";
        },
        resetDialog() {
            this.memberDialog = false;
        },
        invalidateMember(member){
            this.$store.dispatch('invalidateMember', member)
                .then(result => {
                    console.log(result);
                })
                .catch(error => {
                    console.log(error);
                })
        },
        validateMember(){
            /*
            let email;
            if (this.newMember === ''){
                email = '';
            }
            else {
                email = this.newMember.split('(')[1]; // extract email from format "Name (email)"
                email = email.replace(")", "");
            }*/

            //let ths_emails = this.ths_members.map(({ email }) => email);
            if (!this.ths_members.includes(this.newMember)){
                this.$store.commit('alertClient', {
                    color: 'error',
                    text: 'Personen du försöker lägga till inte i listan av THS-medlemmar. Kontrollera kårmedlemskap och lägg till manuellt.',
                    timeout: 6000,
                    snackbar: true,
                    action: {
                        method: 'exit',
                        text: 'Stäng'
                    }
                });
                return
            }

            const email = this.newMember.split('(')[1].replace(')','');
            this.$store.dispatch('validateMember', email)
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
            this.$store.dispatch('getInvalidMembers')
                .then(result => {
                    if(result.status === 'success') {
                        //this.ths_members = result.members;
                        result.members.forEach(member => {
                            this.ths_members.push(`${member.name} (${member.email})`);
                        });
                    }
                })
                .catch(() => {
                    //
                });
            this.$store.dispatch('getValidMembers')
                    .then(result => {
                        if(result.status === 'success') {
                            this.valid_members = result.members;
                            this.$store.commit('populateMemberList', this.valid_members);
                        }
                    })
                    .catch(() => {
                        //
                    });
        }
    }
}
</script>
