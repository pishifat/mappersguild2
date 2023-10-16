<template>
    <div>
        <div class="row">
            <div class="col-sm-3">
                <div class="container card card-body py-3 mb-2">
                    <div class="input-group">
                        <button
                            class="btn btn-primary"
                            href="#"
                        >
                            <i class="fas fa-search" />
                        </button>
                        <input
                            v-model="filterValue"
                            class="form-control form-control-sm"
                            type="text"
                            placeholder="search"
                            maxlength="200"
                            autocomplete="off"
                        />
                    </div>
                    <hr />
                    <div>
                        Contest category
                    </div>
                    <div class="small ms-2">
                        <div>
                            <a
                                href="#"
                                :class="loadingCategory ? 'pe-none opacity-50' : ''"
                                @click.prevent="displayMode = 'activeContests'"
                            >
                                <span :class="displayMode === 'activeContests' ? 'border-bottom border-secondary' : ''">
                                    Active
                                </span>
                            </a>
                        </div>
                        <div>
                            <a
                                href="#"
                                :class="loadingCategory ? 'pe-none opacity-50' : ''"
                                @click.prevent="displayMode = 'completedContests'"
                            >
                                <span :class="displayMode === 'completedContests' ? 'border-bottom border-secondary' : ''">
                                    Completed
                                </span>
                            </a>
                        </div>
                        <div>
                            <a
                                href="#"
                                :class="loadingCategory ? 'pe-none opacity-50' : ''"
                                @click.prevent="displayMode = 'myContests'"
                            >
                                <span :class="displayMode === 'myContests' ? 'border-bottom border-secondary' : ''">
                                    My contests
                                </span>
                            </a>
                        </div>
                    </div>
                    <hr />
                    <div>
                        Contest mode
                    </div>
                    <div class="small mx-2">
                        <div>
                            <a href="#" @click.prevent="filterMode = ''">
                                <span :class="filterMode === '' ? 'border-bottom border-secondary' : ''">
                                    Any
                                </span>
                            </a>
                        </div>
                        <div>
                            <a href="#" @click.prevent="filterMode = 'osu'">
                                <span :class="filterMode === 'osu' ? 'border-bottom border-secondary' : ''">
                                    osu!
                                </span>
                            </a>
                        </div>
                        <div>
                            <a href="#" @click.prevent="filterMode = 'taiko'">
                                <span :class="filterMode === 'taiko' ? 'border-bottom border-secondary' : ''">
                                    osu!taiko
                                </span>
                            </a>
                        </div>
                        <div>
                            <a href="#" @click.prevent="filterMode = 'catch'">
                                <span :class="filterMode === 'catch' ? 'border-bottom border-secondary' : ''">
                                    osu!catch
                                </span>
                            </a>
                        </div>
                        <div>
                            <a href="#" @click.prevent="filterMode = 'mania'">
                                <span :class="filterMode === 'mania' ? 'border-bottom border-secondary' : ''">
                                    osu!mania
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
                <hr />
                <add-contest
                    v-if="
                        displayMode == 'myContests' &&
                        contests &&
                        !loadedSpecificContest
                    "
                />
                <transition-group name="list" tag="div" class="row">
                    <contest-card
                        v-for="contest in filteredContests"
                        :key="contest.id"
                        class="col-sm-12 my-2"
                        :contest="contest"
                        :route="'listing'"
                    />
                </transition-group>
                <div
                    v-if="!contests"
                    class="container card card-body py-3 mb-2 text-secondary"
                >
                    Loading...
                </div>
                <div
                    v-if="contests && !filteredContests.length"
                    class="container card card-body py-3 mb-2 text-secondary"
                >
                    No contests available. Try other filters!
                </div>
                <div v-if="loadedSpecificContest">
                    <button
                        class="btn w-100 btn-info"
                        type="button"
                        @click="loadMore($event)"
                    >
                        Load other contests
                    </button>
                </div>
                <div
                    v-else-if="
                        moreContestsAvailable &&
                        contests &&
                        contests.length >= limit
                    "
                >
                    <button
                        class="btn w-100 btn-info"
                        type="button"
                        @click="loadMore($event)"
                    >
                        Load more contests
                    </button>
                </div>
            </div>
            <div class="col-sm-9 container card card-body">
                <div v-if="!selectedContestId">
                    <h5>View a contest</h5>
                    <div class="mb-2">
                        Select a contest on the left.
                        <a
                            href="#"
                            :class="loadingCategory ? 'pe-none opacity-50' : ''"
                            @click.prevent="displayMode = 'activeContests'"
                        >
                            <span :class="displayMode === 'activeContests' ? 'border-bottom border-secondary' : ''">
                                Active
                            </span>
                        </a>
                        contests are displayed by default, and previous contests can be viewed by loading the
                        <a
                            href="#"
                            :class="loadingCategory ? 'pe-none opacity-50' : ''"
                            @click.prevent="displayMode = 'completedContests'"
                        >
                            <span :class="displayMode === 'completedContests' ? 'border-bottom border-secondary' : ''">
                                Completed
                            </span>
                        </a>
                        category.
                    </div>
                    <div class="mb-3">
                        Narrow down results to any mode with the <i>Contest mode</i> filter.
                    </div>
                    <h5>Create a contest</h5>
                    Aiming to start your own contest? Filter to the
                    <a
                        href="#"
                        :class="loadingCategory ? 'pe-none opacity-50' : ''"
                        @click.prevent="displayMode = 'myContests'"
                    >
                        <span :class="displayMode === 'myContests' ? 'border-bottom border-secondary' : ''">
                            My contests
                        </span>
                    </a>
                    category and add one from the left-side menu!
                </div>
                <limited-contest-info
                    v-else-if="displayMode !== 'myContests'"
                    :contest="selectedContest"
                />
                <contest-info
                    v-else-if="
                        creatorIds.includes(loggedInUser.id) ||
                        loggedInUser.osuId == 3178418
                    "
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
    data() {
        return {
            displayMode: 'activeContests',
            filterMode: '',
            filterValue: '',
            firstLoadComplete: false,
            loadedSpecificContest: false,
            limit: 200,
            skip: 0,
            total: 0,
            moreContestsAvailable: true,
            loadingCategory: false,
        };
    },
    computed: {
        ...mapState(['loggedInUser']),
        ...mapState({
            contests: (state: any) => state.contests.contests,
            selectedContestId: (state: any) => state.contests.selectedContestId,
        }),
        ...mapGetters(['selectedContest']),
        filteredContests(): Contest[] {
            if (this.contests) {
                let fContests = [...this.contests];

                if (this.filterMode.length) {
                    fContests = fContests.filter(c => c.mode == this.filterMode);
                }

                if (this.filterValue.length) {
                    const lowercaseFilterValue = this.filterValue.toLowerCase();
                    fContests = fContests.filter(c => c.name.toLowerCase().includes(lowercaseFilterValue));
                }

                return fContests;
            } else {
                return [];
            }
        },
        creatorIds(): string[] {
            return this.selectedContest.creators.map(c => c.id);
        },
    },
    watch: {
        async displayMode() {
            this.moreContestsAvailable = true;
            this.skip = 0;

            if (this.firstLoadComplete) {
                this.loadingCategory = true;
                this.$store.commit('setContests', null);
                this.$store.commit('setSelectedContestId', null);
                this.$router.replace(`/contests/listing`);
                await this.loadContests();
                this.loadingCategory = false;
            }
        },
    },
    beforeCreate() {
        if (!this.$store.hasModule('contests')) {
            this.$store.registerModule('contests', listingModule);
        }
    },
    unmounted() {
        if (this.$store.hasModule('contests')) {
            this.$store.unregisterModule('contests');
        }
    },
    async created() {
        await this.loadContests();
        this.firstLoadComplete = true;
    },
    methods: {
        async loadContests(): Promise<void> {
            const id = this.$route.query.contest;

            if (id && !this.firstLoadComplete) {
                const contest: any = await this.$http.initialRequest(
                    `/contests/listing/searchContest/${id}`
                );

                if (!this.$http.isError(contest)) {
                    const tempCreatorIds = contest.creators.map(c => c.id);

                    if (tempCreatorIds.includes(this.loggedInUser.id)) {
                        this.displayMode = 'myContests';
                    } else if (contest.status == 'complete') {
                        this.displayMode = 'completedContests';
                    } else {
                        this.displayMode == 'activeContests';
                    }

                    this.$store.commit('setContests', [contest] || []);
                    this.$store.commit('setSelectedContestId', id);

                    this.loadedSpecificContest = true;
                } else {
                    this.$router.replace(`/contests/listing`);
                    this.firstLoadComplete = true;
                    await this.loadContests();
                }
            } else {
                let contests;

                if (!this.firstLoadComplete) {
                    contests = await this.$http.initialRequest<Contest[]>(
                        `/contests/listing/relevantInfo?displayMode=${this.displayMode}&limit=${this.limit}&skip=${this.skip}`
                    );
                } else {
                    contests = await this.$http.executeGet<Contest[]>(
                        `/contests/listing/relevantInfo?displayMode=${this.displayMode}&limit=${this.limit}&skip=${this.skip}`
                    );
                }

                if (!this.$http.isError(contests)) {
                    this.skip += this.limit;
                    this.$store.commit('setContests', contests);
                    this.$store.commit('setSelectedContestId', null);

                    this.loadedSpecificContest = false;

                    if (contests.length < this.limit) {
                        this.moreContestsAvailable = false;
                    }
                }
            }
        },
        async loadMore(e): Promise<void> {
            this.total = this.contests.length;

            const contests = await this.$http.executeGet<Contest[]>(
                `/contests/listing/relevantInfo?displayMode=${this.displayMode}&limit=${this.limit}&skip=${this.skip}`,
                e
            );

            if (!this.$http.isError(contests)) {
                if (this.skip == 0) {
                    this.$store.commit('setContests', contests);
                } else {
                    this.$store.commit('setContests', [
                        ...(this.contests || []),
                        ...contests,
                    ]);
                }

                this.skip += this.limit;
                this.$store.commit('setSelectedContestId', null);
                this.loadedSpecificContest = false;
            }

            if (this.total == this.contests.length) {
                this.moreContestsAvailable = false;

                this.$store.dispatch('updateToastMessages', {
                    message: `No more contests to load!`,
                    type: 'info',
                });
            }
        },
    },
});
</script>
