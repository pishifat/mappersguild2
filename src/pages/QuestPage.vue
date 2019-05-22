<template>
    <div class="row container bg-container py-3">
        <div class="col-lg-6"> <!--use 9 for 2 columns open-->
            <h2>
                Available
                <sup
                    style="font-size: 12pt"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="view additional info"
                >
                    <a href="#" @click.prevent data-toggle="modal" data-target="#availableInfo">?</a>
                </sup>
            </h2>
            <div class="linear-divisor"></div>
            <div class="row small mt-2 mb-3">
                <div class="col-auto filter-title">
                    Sort
                </div>
                <div class="col">
                    <a
                        :class="sortByOpen === 'createdAt' ? 'sorted' : 'unsorted'"
                        href="#"
                        @click.prevent="sortOpenQuests('createdAt')"
                        >Date added</a
                    >
                    <a
                        :class="sortByOpen === 'reward' ? 'sorted' : 'unsorted'"
                        href="#"
                        @click.prevent="sortOpenQuests('reward')"
                        >Reward</a
                    >
                    <a
                        :class="sortByOpen === 'minParty' ? 'sorted' : 'unsorted'"
                        href="#"
                        @click.prevent="sortOpenQuests('minParty')"
                        >Required party size</a
                    >
                </div>
            </div>

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

            <div class="row" v-if="!openQuests">
                <h5 class="ml-1">There are currently no open quests!</h5>
                <p class="ml-2">Check back later.</p>
            </div>
        </div>

        <div class="col-lg-6"> <!--use 3 for 2 columns open-->
            <h2>
                In progress
                <sup
                    style="font-size: 12pt"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="view additional info"
                >
                    <a href="#" @click.prevent data-toggle="modal" data-target="#wipInfo">?</a>
                </sup>
            </h2>
            <div class="linear-divisor"></div>
            <div class="row small mt-2 mb-3">
                <div class="col-auto filter-title">
                    Sort
                </div>
                <div class="col">
                    <a
                        :class="sortByWip === 'createdAt' ? 'sorted' : 'unsorted'"
                        href="#"
                        @click.prevent="sortWipQuests('createdAt')"
                        >Date added</a
                    >
                    <a
                        :class="sortByWip === 'deadline' ? 'sorted' : 'unsorted'"
                        href="#"
                        @click.prevent="sortWipQuests('deadline')"
                        >Deadline</a
                    >
                </div>
            </div>

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
            <div class="row" v-if="!wipQuests">
                <h5 class="ml-1">There are currently no running quests!</h5>
                <p class="ml-2">Check back later.</p>
            </div>
        </div>

        <!-- available quest info -->
        <div id="availableInfo" class="modal fade" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content bg-dark">
                    <div class="modal-header modal-header-card text-dark bg-open">
                        <h5 class="modal-title modal-title-card">Available quest information</h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body modal-body-card" style="overflow: hidden;">
                        <img src="../images/the_A.png" class="the-a-background" />
                        <p class="text-shadow">By accepting a quest, you're taking a risk.</p>
                        <p class="text-shadow small">
                            <span class="errors">Dropping</span> a quest or
                            <span class="errors">leaving</span> its assigned party prematurely will result in
                            user point losses. New users cannot join your party after a quest is accepted, so
                            be sure to organize your party beforehand.
                        </p>
                        <p class="text-shadow small">
                            There is a window of leniency however -- for the first week after a party accepts
                            a quest, new mappers can be invited to the party via
                            <span class="done">invite only</span>. Invites are handled by a party's leader.
                        </p>
                        <p class="text-shadow">New quests are added every week.</p>
                        <p class="text-shadow small">
                            Quests are mainly meant to highlight new or infrequently mapped featured artists.
                        </p>
                        <p class="text-shadow small">
                            Because the Mappers' Guild is currently starting out, one or two new quests are
                            added daily. This will be scaled back later.
                        </p>
					    <div class="radial-divisor mx-auto my-4"></div>
                        <p class="text-shadow">
                            If you're confused about something not listed here or on the
                            <a href="/faq#quest">FAQ page</a>, send a message in the
                            <a href="https://discordapp.com/invite/ppy">#mappers-guild</a> channel!
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- work in progress quest info -->
        <div id="wipInfo" class="modal fade" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content bg-dark">
                    <div class="modal-header modal-header-card text-dark bg-wip">
                        <h5 class="modal-title modal-title-card">Work-in-progress quest information</h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body modal-body-card" style="overflow: hidden;">
                        <img src="../images/the_A.png" class="the-a-background" />
                        <p class="text-shadow">Quests are first-come first-serve...</p>
                        <p class="text-shadow small">
                            ...however, if you're interested in doing a quest with mappers primarily from a
                            different game-mode than the one currently handling the quest, talk to
                            <a href="https://osu.ppy.sh/users/3178418" target="_blank">pishifat</a>.
                            Work-in-progress quests without rank restrictions can potentially be opened for
                            another game-mode.
                        </p>
                        <p class="text-shadow">Failing to meet a deadline isn't the end of the world.</p>
                        <p class="text-shadow small">
                            By failing to meet a deadline you won't receive the quest's bonus reward, but
                            tasks will still earn their +2 additional quest points upon the quest's
                            completion. If you drag a quest on indefinitely though, it will be marked as
                            dropped and your party's members will lose points.
                        </p>
                        <p class="text-shadow small">
                            To keep yourself on track, try to get your maps checked by Beatmap Nominators at
                            least 2 week before the deadline. Otherwise, your mapsets may not reach ranked in
                            time!
                        </p>
					    <div class="radial-divisor mx-auto my-4"></div>
                        <p class="text-shadow">
                            If you're confused about something not listed here or on the
                            <a href="/faq#quest">FAQ page</a>, send a message in the
                            <a href="https://discordapp.com/invite/ppy">#mappers-guild</a> channel!
                        </p>
                    </div>
                </div>
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
        LimitedPartyInfo,
    },
    methods: {
        executePost: async function(path, data, e) {
            if (e) e.target.disabled = true;

            try {
                const res = await axios.post(path, data);

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
        sortOpenQuests: function(field, keepOrder) {
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
                        if (a.createdAt > b.createdAt) return -1;
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
                        if (a.reward > b.reward) return -1;
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
                        if (a.minParty > b.minParty) return -1;
                    }
                    return 0;
                });
            }
        },
        sortWipQuests: function(field, keepOrder) {
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
                        if (a.createdAt > b.createdAt) return -1;
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
                        if (a.deadline > b.deadline) return -1;
                    }
                    return 0;
                });
            }
        },
        //real functions
        acceptQuest: async function(args) {
            let id = args.id;
            let e = args.e;
            var result = confirm('Are you sure?');
            if (result) {
                $('.card-body').removeAttr('data-toggle');
                $('.accept').prop('disabled', true);
                const quest = await this.executePost('/quests/acceptQuest/' + id, {}, e);
                if (quest) {
                    e.target.disabled = true;
                    const i = this.openQuests.findIndex(q => q.id === id);
                    this.openQuests.splice(i, 1);
                    $('#extendedInfo').modal('hide');
                    this.partyQuest = id;
                    this.wipQuests.push(quest);
                } else {
                    $('.accept').prop('disabled', false);
                }
                $('.card-body').attr('data-toggle', 'modal');
            }
        },
        dropQuest: async function(args) {
            let id = args.id;
            let e = args.e;
            var result = confirm('Are you sure? This will result in a points penalty');
            if (result) {
                $('.card-body').removeAttr('data-toggle');
                $('.drop').prop('disabled', true);
                const quest = await this.executePost('/quests/dropQuest/' + id, {}, e);
                if (quest) {
                    e.target.disabled = true;
                    const i = this.wipQuests.findIndex(q => q.id === id);
                    this.wipQuests.splice(i, 1);
                    $('#extendedInfo').modal('hide');
                    this.partyQuest = undefined;
                    if (quest.status != 'hidden') {
                        this.openQuests.push(quest);
                    }
                } else {
                    $('.accept').prop('disabled', false);
                }
                $('.card-body').attr('data-toggle', 'modal');
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
        };
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
            })
            .then(function() {
                $('#loading').fadeOut();
                $('#app')
                    .attr('style', 'visibility: visible')
                    .hide()
                    .fadeIn();
            });
    },
    mounted() {
        setInterval(() => {
            axios.get('/quests/relevantInfo').then(response => {
                this.openQuests = response.data.openQuests;
                this.wipQuests = response.data.wipQuests;
                this.partyQuest = response.data.quest;
                this.partyRank = response.data.rank;
                this.partySize = response.data.members.length;
                this.partyName = response.data.name;
            });
        }, 300000);
    },
};
</script>

<style>
</style>
