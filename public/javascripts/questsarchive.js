const questsVue = new Vue({
    el: '#app',
    methods: {
        extendedInfo: function (quest) {
            this.selectedQuest = quest;
        },
        sort: function (field) {
			if (field == 'createdAt') {
				this.sortedByDate = this.sortedByDate === null ? true : !this.sortedByDate;
				this.sortedByReward = null;
				this.sortedBySize = null;

				this.completeQuests.sort((a, b) => {
					if (this.sortedByDate) {
						if (a.createdAt > b.createdAt) return 1;
						if (a.createdAt < b.createdAt) return -1;
					} else {
						if (a.createdAt < b.createdAt) return 1;
						if (a.createdAt > b.createdAt) return -1
					}
					return 0;
				});
			} else if (field == 'reward') {
				this.sortedByReward = this.sortedByReward === null ? true : !this.sortedByReward;
				this.sortedByDate = null;
				this.sortedBySize = null;

				this.completeQuests.sort((a, b) => {
					if (this.sortedByReward) {
						if (a.reward > b.reward) return 1;
						if (a.reward < b.reward) return -1;
					} else {
						if (a.reward < b.reward) return 1;
						if (a.reward > b.reward) return -1
					}
					return 0;
				});
			} else if (field == 'minParty') {
				this.sortedBySize = this.sortedBySize === null ? true : !this.sortedBySize;
				this.sortedByDate = null;
				this.sortedByReward = null;

				this.completeQuests.sort((a, b) => {
					if (this.sortedBySize) {
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
            sortedByDate: null,
            sortedByReward: null,
            sortedBySize: null,
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

            if (questsVue.sortedByDate !== null) {
				questsVue.sortedByDate = !questsVue.sortedByDate;
				questsVue.sort('createdAt');
			} else if (questsVue.sortedByReward !== null) {
				questsVue.sortedByReward = !questsVue.sortedByReward;
				questsVue.sort('reward');
			} else if (questsVue.sortedBySize !== null) {
				questsVue.sortedBySize = !questsVue.sortedBySize;
				questsVue.sort('minParty');
			}
        });
}, 30000);
