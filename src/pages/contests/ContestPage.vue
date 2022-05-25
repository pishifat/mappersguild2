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
                    v-if="displayMode == 'myContests' && contests"
                />
                <transition-group name="list" tag="div" class="row">
                    <contest-card
                        v-for="contest in contests"
                        :key="contest.id"
                        :contest="contest"
                    />
                </transition-group>
                <div v-if="!contests" class="container card card-body py-3 mb-2 text-secondary">
                    Loading...
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
import ContestCard from '@components/contests/listing/ContestCard.vue';
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
            await this.loadContests();
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
        const contests = await this.$http.initialRequest<Contest[]>(`/contests/listing/relevantInfo/${this.displayMode}`);

        if (!this.$http.isError(contests)) {
            this.$store.commit('setContests', contests);
        }
    },
    methods: {
        async loadContests (): Promise<void> {
            this.$store.commit('setContests', null);
            this.$store.commit('setSelectedContestId', null);
            const contests = await this.$http.executeGet<Contest[]>(`/contests/listing/relevantInfo/${this.displayMode}`);

            if (!this.$http.isError(contests)) {
                this.$store.commit('setContests', contests);
                this.$store.commit('setSelectedContestId', null);
            }
        },
    },
});
</script>
