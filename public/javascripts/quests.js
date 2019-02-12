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
        sortOpenQuests: function (field, keepOrder) {
            this.sortByOpen = field;
			if (!keepOrder) {
				this.ascOpen = !this.ascOpen;
            }

			if (field == 'createdAt') {
				this.openQuests.sort((a, b) => {
					if (this.ascOpen) {
						if (a.createdAt > b.createdAt) return 1;
						if (a.createdAt < b.createdAt) return -1;
					} else {
						if (a.createdAt < b.createdAt) return 1;
						if (a.createdAt > b.createdAt) return -1
					}
					return 0;
				});
			} else if (field == 'reward') {
				this.openQuests.sort((a, b) => {
					if (this.ascOpen) {
						if (a.reward > b.reward) return 1;
						if (a.reward < b.reward) return -1;
					} else {
						if (a.reward < b.reward) return 1;
						if (a.reward > b.reward) return -1
					}
					return 0;
				});
			} else if (field == 'minParty') {
				this.openQuests.sort((a, b) => {
					if (this.ascOpen) {
						if (a.minParty > b.minParty) return 1;
						if (a.minParty < b.minParty) return -1;
					} else {
						if (a.minParty < b.minParty) return 1;
						if (a.minParty > b.minParty) return -1
					}
					return 0;
				});
			}
        },
        sortWipQuests: function (field, keepOrder) {
            this.sortByWip = field;
			if (!keepOrder) {
				this.ascWip = !this.ascWip;
            }

			if (field == 'createdAt') {
				this.wipQuests.sort((a, b) => {
					if (this.ascWip) {
						if (a.createdAt > b.createdAt) return 1;
						if (a.createdAt < b.createdAt) return -1;
					} else {
						if (a.createdAt < b.createdAt) return 1;
						if (a.createdAt > b.createdAt) return -1
					}
					return 0;
				});
			} else if (field == 'deadline') {
				this.wipQuests.sort((a, b) => {
					if (this.ascWip) {
						if (a.deadline > b.deadline) return 1;
						if (a.deadline < b.deadline) return -1;
					} else {
						if (a.deadline < b.deadline) return 1;
						if (a.deadline > b.deadline) return -1
					}
					return 0;
				});
			}
		},
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
			sortByOpen: null,
            ascOpen: false,
            sortByWip: null,
			ascWip: false,
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
            questsVue.sortOpenQuests(questsVue.sortByOpen, true);
            questsVue.sortWipQuests(questsVue.sortByWip, true);
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