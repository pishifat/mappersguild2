<template>

<div class="row">
    <div class="col-lg-9">
        <h2>Available</h2>
        <small>Sort: 
            <a :class="sortByOpen === 'createdAt' ? 'sorted' : ''" href="#" @click.prevent="sortOpenQuests('createdAt')">Date added</a> | 
            <a :class="sortByOpen === 'reward' ? 'sorted' : ''" href="#" @click.prevent="sortOpenQuests('reward')">Reward</a> | 
            <a :class="sortByOpen === 'minParty' ? 'sorted' : ''" href="#" @click.prevent="sortOpenQuests('minParty')">Required party size</a>
        </small>
        <div id="openQuests">
            <transition-group name="list" tag="div" class="row">
                <quest-card
                    v-for="quest in openQuests" 
                    :key="quest.id"
                    :quest="quest"
                    :party-quest="partyQuest"
                    :party-rank="partyRank"
                    :party-size="partySize"
                    @update:selectedQuest="selectedQuest = $event" 
                    @accept-quest="acceptQuest($event)" 
                ></quest-card>
            </transition-group>
        </div>
    </div>
    <div class="col-lg-3">
        <h2>In progress</h2>
        <small>Sort: 
            <a :class="sortByWip === 'createdAt' ? 'sorted' : ''" href="#" @click.prevent="sortWipQuests('createdAt')">Date added</a> | 
            <a :class="sortByWip === 'deadline' ? 'sorted' : ''" href="#" @click.prevent="sortWipQuests('deadline')">Deadline</a>
        </small>
        <div id="wipQuests">
            <transition-group name="list" tag="div" class="row">
                <quest-card
                    v-for="quest in wipQuests" 
                    :key="quest.id"
                    :quest="quest"
                    :party-quest="partyQuest"
                    :party-rank="partyRank"
                    :party-size="partySize"
                    @update:selectedQuest="selectedQuest = $event"
                    @drop-quest="dropQuest($event)"
                ></quest-card>
            </transition-group>
        </div>
    </div>

    <quest-info
        :quest="selectedQuest"
        :party-quest="partyQuest"
        :party-rank="partyRank"
        :party-size="partySize"
        :party-name="partyName"
        @accept-quest="acceptQuest($event)" 
        @drop-quest="dropQuest($event)"
    ></quest-info>
    <notifications-access></notifications-access>
</div>

</template>

<script>
import QuestCard from '../components/quests/QuestCard.vue';
import QuestInfo from '../components/quests/QuestInfo.vue';
import NotificationsAccess from '../components/NotificationsAccess.vue';
import LimitedPartyInfo from '../components/LimitedPartyInfo.vue';

export default {
    name: 'quest-page',
    components: {
        QuestCard,
        QuestInfo,
        NotificationsAccess,
        LimitedPartyInfo
    },
    methods: {
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
                this.info = 'Something went wrong';
            }
            if (e) e.target.disabled = false;
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
        //real functions
        acceptQuest: async function (args) {
            let id = args.id;
            let e = args.e;
            var result = confirm("Are you sure?");
            if (result) {
                $('.card-body').removeAttr("data-toggle");
                $('.accept').prop("disabled", true);
                const quest = await this.executePost('/quests/acceptQuest/' + id, {}, e);
                if (quest) {
                    e.target.disabled = true;
                    const i = this.openQuests.findIndex(q => q.id === id);
                    this.openQuests.splice(i, 1);
                    $('#extendedInfo').modal('hide');
                    this.partyQuest = id;
                    this.wipQuests.push(quest);
                } else {
                    $('.accept').prop("disabled", false);
                }
                $('.card-body').attr("data-toggle", "modal");
            }
        },
        dropQuest: async function (args) {
            let id = args.id;
            let e = args.e;
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
    created() {
        axios
            .get('/quests/relevantInfo')
            .then(response => {
                this.openQuests = response.data.openQuests;
                this.wipQuests = response.data.wipQuests;
                this.partyQuest = response.data.quest;
                this.partyRank = response.data.rank;
                this.partySize = response.data.members.length;
                this.partyName = response.data.name;
            }).then(function(){
                $("#loading").fadeOut();
				$("#app").attr("style", "visibility: visible").hide().fadeIn();
			});
    },
    mounted () {
        setInterval(() => {
            axios
            .get('/quests/relevantInfo')
            .then(response => {
                this.openQuests = response.data.openQuests;
                this.wipQuests = response.data.wipQuests;
                this.partyQuest = response.data.quest;
                this.partyRank = response.data.rank;
                this.partySize = response.data.members.length;
                this.partyName = response.data.name;
            });
        }, 30000);
    }
}
</script>

<style>

</style>
