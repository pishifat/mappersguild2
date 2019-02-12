const questsVue = new Vue({
    el: '#app',
    methods: {
        extendedInfo: function (quest) {
            this.selectedQuest = quest;
        },
        sort: function (field, keepOrder) {
			this.sortBy = field;
			if (!keepOrder) {
				this.asc = !this.asc;
			}
			
			if (field == 'createdAt') {
				this.completeQuests.sort((a, b) => {
					if (this.asc) {
						if (a.createdAt > b.createdAt) return 1;
						if (a.createdAt < b.createdAt) return -1;
					} else {
						if (a.createdAt < b.createdAt) return 1;
						if (a.createdAt > b.createdAt) return -1
					}
					return 0;
				});
			} else if (field == 'reward') {
				this.completeQuests.sort((a, b) => {
					if (this.asc) {
						if (a.reward > b.reward) return 1;
						if (a.reward < b.reward) return -1;
					} else {
						if (a.reward < b.reward) return 1;
						if (a.reward > b.reward) return -1
					}
					return 0;
				});
			} else if (field == 'minParty') {
				this.completeQuests.sort((a, b) => {
					if (this.asc) {
						if (a.minParty > b.minParty) return 1;
						if (a.minParty < b.minParty) return -1;
					} else {
						if (a.minParty < b.minParty) return 1;
						if (a.minParty > b.minParty) return -1
					}
					return 0;
				});
			}
		}
    },
    data() {
        return {
            completeQuests: null,
            selectedQuest: null,
			sortBy: null,
			asc: false,
        }
    },
    mounted() {
        axios
            .get('/questsarchive/quests')
            .then(response => {
                this.completeQuests = response.data;
            });
    }
});

setInterval(() => {
    axios
        .get('/questsarchive/quests')
        .then(response => {
            questsVue.completeQuests = response.data;
            questsVue.sort(questsVue.sortBy, true);
        });
}, 30000);
