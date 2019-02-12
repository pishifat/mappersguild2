const partiesVue = new Vue({
	el: '#app',
	methods: {
		extendedInfo: function (party) {
			this.selectedParty = party;
			this.info = null;
		},
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
		joinParty: async function (id) {
			$('.card-body').removeAttr("data-toggle");
			$('.join').prop("disabled", true);
			const party = await this.executePost('/parties/join', { partyId: id });
			if (party) {
				this.userPartyId = party.id;
				this.updateParty(party);
			}
			$('.card-body').attr("data-toggle", "modal");
			$('.join').prop("disabled", false);
		},
		leaveParty: async function (id) {
			const result = confirm("Are you sure you want to leave the party?")
			if (result) {
				$('.card-body').removeAttr("data-toggle");
				const party = await this.executePost('/parties/leave', { partyId: id });
				if (party) {
					this.userPartyId = null;
					this.updateParty(party);
				}
				$('.card-body').attr("data-toggle", "modal");
			}
		},
		rename: async function (e) {
			if (this.selectedParty.name.length < 3 || this.selectedParty.name.length > 32) {
				this.info = 'Choose a name between 3 and 32 characters!';
			} else {
				const party = await this.executePost('/parties/rename', { id: this.selectedParty.id, newName: this.selectedParty.name }, e);
				if (party) {
					this.updateParty(party);
					this.info = `Party renamed to ${party.name}!`;
				}
			}
		},
		kickMember: async function (e) {
			const user = $("#extendedInfo #kick").val();
			if (user == "none") {
				this.info = 'Select a user to kick!';
			} else {
				var result = confirm(`Are you sure you want to kick? This action cannot be undone`);
				if (result) {
					const party = await this.executePost('/parties/kick', { user: user }, e);
					if (party) {
						this.updateParty(party);
						this.info = 'User has been kicked!';
					}
				}
			}
		},
		transferLeader: async function (e) {
			const user = $("#extendedInfo #transfer").val();
			if (user == "none") {
				this.info = 'Select a user to transfer host!';
			} else {
				var result = confirm(`Are you sure you want to transfer leadership? This action cannot be undone`);
				if (result) {
					const party = await this.executePost('/parties/transferLeader', { user: user }, e);
					if (party) {
						this.updateParty(party);
						this.info = 'Leader has been transferred!';
					}
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
		addBanner: async function (e) {
			const party = await this.executePost('/parties/addBanner', { banner: this.selectedParty.art }, e);
			if (party) {
				this.updateParty(party);
				this.info = 'Banner added!';
			}
		},
		switchLock: async function (e) {
			const party = await this.executePost('/parties/switchLock', { partyId: this.selectedParty.id }, e);
			if (party) {
				this.updateParty(party);
			}
		},
		createParty: async function (e) {
			const name = $("#partyName").val();
			if (name.length < 3 || name.length > 32) {
				this.info = `Party name must be bewteen 3 and 32 characters! Yours is ${name.length} ${name.length == 1 ? 'character' : 'characters'}`;
			} else {
				const party = await this.executePost('/parties/create', { name: name }, e);
				if (party) {
					this.userPartyId = party.id;
					this.parties.push(party);
					$('#createParty').modal('hide');
				}
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
	data() {
		return {
			parties: null,
			selectedParty: null,
			userId: null,
			userPartyId: null,
			info: '',
			sortBy: null,
			asc: false,
		}
	},
	mounted() {
		axios
			.get('/parties/parties')
			.then(response => (this.parties = response.data));
		axios
			.get('/parties/currentParty')
			.then(response => {
				this.userPartyId = response.data.party;
				this.userId = response.data.user;
			})
		
	}
});

setInterval(() => {
	axios
		.get('/parties/parties')
		.then(response => {
			partiesVue.parties = response.data;
			partiesVue.sort(partiesVue.sortBy, true);
		});
}, 30000);