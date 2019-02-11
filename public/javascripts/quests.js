const questsVue = new Vue({
    el: '#app',
    methods: {
        extendedInfo: function (quest) {
            this.selectedQuest = quest;
            this.timeframe = Math.floor(this.selectedQuest.timeframe / (1000 * 60 * 60 * 24));
        },
        executePost: async function (path, data, e) {
            if (e) e.target.disabled = true;

            try {
                const res = await axios.post(path, data)
                console.log(res);

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
        acceptQuest: async function (id, e) {
            var result = confirm("Are you sure? Dropping the quest will result in a points penalty");
            if (result) {
                $('.card-body').removeAttr("data-toggle");
                $('.accept').prop("disabled", true);
                const quest = await this.executePost('/quests/acceptQuest/' + id, {}, e);
                if (quest) {
                    e.target.disabled = true;
                    const i = this.openQuests.findIndex(q => q.id === id);
                    this.openQuests.splice(i, 1);
                    //createWipQuestCard(q, result);
                    $('#extendedInfo').modal('hide');
                    this.partyQuest = id;
                    this.wipQuests.push(quest);
                } else {
                    $('.accept').prop("disabled", false);
                }
                $('.card-body').attr("data-toggle", "modal");
            }
        },
        dropQuest: async function (id, e) {
            var result = confirm("Are you sure? This will result in a points penalty");
            if (result) {
                $('.card-body').removeAttr("data-toggle");
                $('.drop').prop("disabled", true);
                const quest = await this.executePost('/quests/dropQuest/' + id, {}, e);
                if (quest) {
                    e.target.disabled = true;
                    const i = this.wipQuests.findIndex(q => q.id === id);
                    this.wipQuests.splice(i, 1);
                    $('#extendedInfo').modal('hide');
                    this.partyQuest = undefined;
                    if (quest.status != "hidden") {
                        this.openQuests.push(quest);
                    }
                } else {
                    $('.accept').prop("disabled", false);
                }
                $('.card-body').attr("data-toggle", "modal");
            }
        },
        sort: function (field) {
			if (field == 'createdAt') {
				this.sortedByDate = this.sortedByDate === null ? true : !this.sortedByDate;
				this.sortedByReward = null;
				this.sortedBySize = null;

				this.openQuests.sort((a, b) => {
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

				this.openQuests.sort((a, b) => {
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

				this.openQuests.sort((a, b) => {
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
            openQuests: null,
            wipQuests: null,
            selectedQuest: null,
            partyQuest: null,
            partyRank: null,
            partySize: null,
            partyName: null,
            timeframe: null,
            remainingTime: null,
            sortedByDate: null,
            sortedByReward: null,
            sortedBySize: null,
        }
    },
    mounted() {
        axios
            .get('/quests/currentQuest')
            .then(response => {
                this.partyQuest = response.data.quest;
                this.partyRank = response.data.rank;
                this.partySize = response.data.members.length;
                this.partyName = response.data.name;
            });
        axios
            .get('/quests/quests')
            .then(response => {
                this.openQuests = response.data.openQuests;
                this.wipQuests = response.data.wipQuests;
            });
    }
});

setInterval(() => {
    axios
        .get('/quests/quests')
        .then(response => {
            questsVue.openQuests = response.data.openQuests;
            questsVue.wipQuests = response.data.wipQuests;

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

function createAlert(message) {
    var $div = $("<div>", {
        "class": "alert alert-success alert-dismissible fade show alert-fixed",
        "text": message
    });

    var $button = $("<button>", {
        "type": "button",
        "class": "close",
        "data-dismiss": "alert"
    });

    var $span = $("<span>", {
        "html": "&times;"
    });

    $button.append($span);
    $div.append($button);

    $div.appendTo("body").fadeTo(1200, 1).slideUp(500, function () {
        $(this).alert("close")
    });
}