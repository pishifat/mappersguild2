<template>
    <div>
        <div class="row">
            <div class="col-sm-3">
                <div class="container card card-body py-3 mb-2">
                    <a
                        href="#"
                        @click.prevent="displayMode = 'activeContests'"
                    >
                        <span :class="displayMode === 'activeContests' ? 'border-bottom border-secondary' : ''">
                            Active contests
                        </span>
                    </a>
                    <a
                        href="#"
                        @click.prevent="displayMode = 'completedContests'"
                    >
                        <span :class="displayMode === 'completedContests' ? 'border-bottom border-secondary' : ''">Completed contests</span>
                    </a>
                    <a
                        href="#"
                        @click.prevent="displayMode = 'myContests'"
                    >
                        <span :class="displayMode === 'myContests' ? 'border-bottom border-secondary' : ''">My contests</span>
                    </a>
                </div>
                <hr>
                <add-contest
                    v-if="displayMode == 'myContests' && contests && !loadedSpecificContest"
                />
                <transition-group name="list" tag="div" class="row">
                    <contest-card
                        v-for="contest in contests"
                        :key="contest.id"
                        class="col-sm-12 my-2"
                        :contest="contest"
                        :route="'listing'"
                    />
                </transition-group>
                <div v-if="!contests" class="container card card-body py-3 mb-2 text-secondary">
                    Loading...
                </div>
                <div v-if="loadedSpecificContest">
                    <button
                        class="btn w-100 btn-info"
                        type="button"
                        @click="loadMore()"
                    >
                        Load other contests
                    </button>
                </div>
            </div>
            <div class="col-sm-9 container card card-body">
                <div v-if="!selectedContestId">
                    No contest selected! Choose one on the left.
                </div>
                <limited-contest-info
                    v-else-if="displayMode !== 'myContests'"
                    :contest="selectedContest"
                />
                <contest-info
                    v-else-if="selectedContest.creator.id == loggedInUser.id"
                    :contest="selectedContest"
                />
            </div>
        </div>

        <div class="radial-divisor" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import ContestCard from '@components/contests/ContestCard.vue';
import ContestInfo from '@components/contests/listing/ContestInfo.vue';
import LimitedContestInfo from '@components/contests/listing/LimitedContestInfo.vue';
import AddContest from '@components/contests/AddContest.vue';
import { Contest } from '@interfaces/contest/contest';
import listingModule from '@store/contests/contests';

export default defineComponent({
    name: 'ContestPage',
    components: {
        ContestCard,
        AddContest,
        ContestInfo,
        LimitedContestInfo,
    },
    data () {
        return {
            displayMode: 'activeContests',
            firstLoadComplete: false,
            loadedSpecificContest: false,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapState({
            contests: (state: any) => state.contests.contests,
            selectedContestId: (state: any) => state.contests.selectedContestId,
        }),
        ...mapGetters([
            'selectedContest',
        ]),
    },
    watch: {
        async displayMode () {
            if (this.firstLoadComplete) {
                this.$router.replace(`/contests/listing`);
                await this.loadContests();
            }
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('contests')) {
            this.$store.registerModule('contests', listingModule);
        }
    },
    unmounted () {
        if (this.$store.hasModule('contests')) {
            this.$store.unregisterModule('contests');
        }
    },
    async created() {
        await this.loadContests();
        this.firstLoadComplete = true;
    },
    methods: {
        async loadContests (): Promise<void> {
            const id = this.$route.query.contest;

            if (id && !this.contests.length) {
                this.$store.commit('setContests', null);
                this.$store.commit('setSelectedContestId', null);

                const contest: any = await this.$http.initialRequest(`/contests/listing/searchContest/${id}`);

                if (!this.$http.isError(contest)) {
                    if (contest.creator.id == this.loggedInUser.id) {
                        this.displayMode = 'myContests';
                    } else if (contest.status == 'complete') {
                        this.displayMode = 'completedContests';
                    }

                    this.$store.commit('setContests', [contest] || []);
                    this.$store.commit('setSelectedContestId', id);

                    this.loadedSpecificContest = true;
                }
            } else {
                this.$store.commit('setContests', null);
                this.$store.commit('setSelectedContestId', null);

                const contests = await this.$http.executeGet<Contest[]>(`/contests/listing/relevantInfo/${this.displayMode}`);

                if (!this.$http.isError(contests)) {
                    this.$store.commit('setContests', contests);
                    this.$store.commit('setSelectedContestId', null);

                    this.loadedSpecificContest = false;
                }
            }
        },
        async loadMore (): Promise<void> { // only used when a specific contest is pre-loaded
            await this.loadContests();
        },
    },
});
</script>
