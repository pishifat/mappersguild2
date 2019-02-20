<template>
<div class="row">
    <div class="col-md-12">
        <h2>Currently active parties <button class="btn btn-mg" data-toggle="modal" data-target="#createParty" v-if="!userPartyId" @click="newPartyInfo()">Create new party</button></h2>
        <small>Sort: 
            <a :class="sortBy === 'members' ? 'sorted' : ''" href="#" @click.prevent="sort('members')">Members</a> | 
            <a :class="sortBy === 'rank' ? 'sorted' : ''" href="#" @click.prevent="sort('rank')">Rank</a> | 
            <a :class="sortBy === 'createdAt' ? 'sorted' : ''" href="#" @click.prevent="sort('createdAt')">Created</a>
        </small>
        <div id="parties">
            <transition-group name="list" tag="div" class="row">
				<party-card
					v-for="party in parties"
					:key="party.id" 
					:party="party"
					:user-id="userId"
					:user-party-id="userPartyId"
                    @update:selectedParty="selectedParty = $event"
					@join-party="joinParty($event)"
					@leave-party="leaveParty($event)"
					@delete-party="deleteParty($event)"
				></party-card>
            </transition-group>
        </div>
    </div>
    <party-info
        :party="selectedParty"
		:user-id="userId"
		:user-party-id="userPartyId"
        @update-party="updateParty($event)"
		@join-party="joinParty($event)"
		@leave-party="leaveParty($event)"
		@delete-party="deleteParty($event)"
    ></party-info>
    <create-party
        :info="info"
    ></create-party>
	<notifications-access></notifications-access>
</div>
</template>

<script>
import CreateParty from '../components/parties/CreateParty.vue';
import PartyCard from '../components/parties/PartyCard.vue';
import PartyInfo from '../components/parties/PartyInfo.vue';
import NotificationsAccess from '../components/NotificationsAccess.vue';

export default {
    name: 'party-page',
    components: {
        CreateParty,
        PartyInfo,
        PartyCard,
    },
    methods: {
		newPartyInfo: function(){
			this.info = null;
		},
		executePost: async function (path, data, e) {
			if (e) e.target.disabled = true;

			try {
				const res = await axios.post(path, data)

				if (res.data.error) {
					this.info = res.data.error;
				} else {
					if (e) e.target.disabled = false;
					return res.data;
				}
			} catch (error) {
				console.log(error)
			}

			if (e) e.target.disabled = false;
		},
		updateParty: function (party) {
			const i = this.parties.findIndex(p => p.id == party.id);
			this.parties[i] = party;
			this.selectedParty = party;
		},
		joinParty: async function (args) {
			let id = args.id;
			let e = args.e;
			const party = await this.executePost('/parties/join', { partyId: id }, e);
			if (party) {
				this.userPartyId = party.id;
				this.updateParty(party);
			}
		},
		leaveParty: async function (args) {
			let id = args.id;
			let e = args.e;
			const result = confirm("Are you sure you want to leave the party?")
			if (result) {
				const party = await this.executePost('/parties/leave', { partyId: id }, e);
				if (party) {
					this.userPartyId = null;
					this.updateParty(party);
				}
			}
		},
		deleteParty: async function (e) {
			const result = confirm(`Are you sure you want to delete?`);
			if (result) {
				$('.card-body').removeAttr("data-toggle");
				const party = await this.executePost('/parties/delete', {}, e);
				if (party) {
					this.userPartyId = null;
					const i = this.parties.findIndex(p => p.id === party.id);
					this.parties.splice(i, 1);
					$('#extendedInfo').modal('hide');
				}
				$('.card-body').attr("data-toggle", "modal");
			}
		},
		sort: function (field, keepOrder) {
			this.sortBy = field;
			if (!keepOrder) {
				this.asc = !this.asc;
			}
			
			if (field == 'rank') {
				this.parties.sort((a, b) => {
					if (this.asc) {
						if (a.rank > b.rank) return 1;
						if (a.rank < b.rank) return -1;
					} else {
						if (a.rank < b.rank) return 1;
						if (a.rank > b.rank) return -1
					}
					return 0;
				});
			} else if (field == 'members') {

				this.parties.sort((a, b) => {
					if (this.asc) {
						if (a.members.length > b.members.length) return 1;
						if (a.members.length < b.members.length) return -1;
					} else {
						if (a.members.length < b.members.length) return 1;
						if (a.members.length > b.members.length) return -1
					}
					return 0;
				});
			} else if (field == 'createdAt') {
				this.parties.sort((a, b) => {
					if (this.asc) {
						if (a.createdAt > b.createdAt) return 1;
						if (a.createdAt < b.createdAt) return -1;
					} else {
						if (a.createdAt < b.createdAt) return 1;
						if (a.createdAt > b.createdAt) return -1
					}
					return 0;
				});
			}
		}
	},
	data () {
		return {
			parties: null,
			selectedParty: null,
			userId: null,
			userPartyId: null,
			sortBy: null,
			info: null,
            asc: false,
            wasCreatePartyOpened: false,
		}
    },
    created () {
        axios
			.get('/parties/relevantInfo')
			.then(response => {
				this.parties = response.data.parties;
				this.userId = response.data.user;
				this.userPartyId = response.data.party;
			}).then(function(){
				$("#loading").fadeOut();
				$("#app").attr("style", "visibility: visible").hide().fadeIn();
			});
    },
	mounted () {
        setInterval(() => {
            axios
                .get('/parties/relevantInfo')
                .then(response => {
                    this.parties = response.data.parties;
					this.userId = response.data.user;
					this.userPartyId = response.data.party;
                    this.sort(this.sortBy, true);
                });
        }, 30000);
    },
}
</script>

<style>

</style>
