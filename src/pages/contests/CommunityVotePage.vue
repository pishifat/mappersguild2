<template>
    <div class="container card card-body py-1">
        <div v-if="contests && contests.length" class="row">
            <contest-card
                v-for="contest in contests"
                :key="contest.id"
                class="col-sm-4 my-2"
                :contest="contest"
                :route="'vote'"
            />
            <div v-if="loadedSpecificContest && otherContestsExist" class="col-sm-4 my-2">
                <button
                    class="btn w-100 btn-info h-100"
                    type="button"
                    @click="loadMore()"
                >
                    Load other contests
                </button>
            </div>
            <div v-if="selectedContest">
                <hr />
                <h4 class="my-2">
                    {{ selectedContest.name }}
                </h4>

                <h5 v-if="selectedContest.download">
                    <a :href="selectedContest.download" target="_blank">
                        Download all submissions
                    </a>
                </h5>

                <contest-banner
                    v-if="selectedContest.bannerUrl"
                    :banner-url="selectedContest.bannerUrl"
                />

                <!-- eslint-disable-next-line vue/no-v-html -->
                <div v-if="selectedContest.communityVoteDescription" class="small mt-2 bg-dark pt-3 pb-1 px-3 mb-2 rounded" v-html="$md.render(selectedContest.communityVoteDescription)" />

                <hr />

                <div class="mb-2">
                    <community-vote-instructions />
                </div>

                <div class="mb-3 d-flex justify-content-between align-items-center">
                    <div>
                        <span class="me-2">Remaining votes:</span>
                        <template v-if="selectedContest.communityVoteOrderedPriority">
                            <span
                                v-for="i in selectedContest.communityVoteCount"
                                :key="i"
                                class="me-2"
                            >
                                <i
                                    class="fa-star fas"
                                    :class="usedVotes.includes(i) ? 'text-secondary' : 'text-guild'"
                                />
                                <span class="small ms-1">{{ rankLabel(i) }}</span>
                            </span>
                        </template>
                        <template v-else>
                            <i
                                v-for="i in selectedContest.communityVoteCount"
                                :key="i"
                                class="fa-star fas me-1"
                                :class="i > selectedContest.communityVoteCount - usedVotes.filter(v => v > 0).length ? 'text-secondary' : 'text-guild'"
                            />
                        </template>
                    </div>
                    <span v-if="selectedContest.communityVoteEnd">
                        <span v-if="votingClosed" class="text-danger">Voting has closed.</span>
                        <span v-else>Voting closes in <span class="text-guild">{{ countdown }}</span></span>
                    </span>
                </div>

                <transition-group
                    v-if="selectedContest.submissions.length"
                    name="list"
                    tag="div"
                    class="row"
                >
                    <submission-card
                        v-for="submission in voteSortedSubmissions"
                        :key="submission.id"
                        :submission="submission"
                        :vote-count="selectedContest.communityVoteCount"
                        :ordered-priority="selectedContest.communityVoteOrderedPriority"
                        :voting-closed="votingClosed"
                    />
                </transition-group>

                <p v-else class="ms-4">
                    No submissions...
                </p>
            </div>
        </div>

        <div v-else class="text-center p-3">
            No contests are currently open for voting! Return to the <a href="/contests/listing">contests listing</a>.
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import SubmissionCard from '@components/contests/communityVote/SubmissionCard.vue';
import ContestCard from '@components/contests/ContestCard.vue';
import ContestBanner from '@components/contests/listing/ContestBanner.vue';
import CommunityVoteInstructions from '@components/contests/communityVote/CommunityVoteInstructions.vue';
import communityVoteModule from '@store/communityVote';
import { Submission } from '@interfaces/contest/submission';

export default defineComponent({
    name: 'CommunityVotePage',
    components: {
        SubmissionCard,
        ContestCard,
        ContestBanner,
        CommunityVoteInstructions,
    },
    data () {
        return {
            loadedSpecificContest: false,
            otherContestsExist: false,
            shuffledSubmissions: [] as any[],
            countdown: '',
            countdownInterval: null as ReturnType<typeof setInterval> | null,
        };
    },
    computed: {
        ...mapState({
            contests: (state: any) => state.communityVote.contests,
        }),
        ...mapState([
            'loggedInUser',
        ]),
        ...mapGetters([
            'selectedContest',
            'usedVotes',
        ]),
        votingClosed(): boolean {
            if (!this.selectedContest?.communityVoteEnd) return false;

            return new Date() > new Date(this.selectedContest.communityVoteEnd);
        },
        voteSortedSubmissions(): Submission[] {
            const getVote = (s: Submission) => s.communityVotes?.find(v => v.voter?.id === this.loggedInUser?.id && v.vote > 0)?.vote ?? 0;

            if (this.selectedContest?.communityVoteOrderedPriority) {
                return [...this.shuffledSubmissions].sort((a, b) => {
                    const aVote = getVote(a);
                    const bVote = getVote(b);
                    if (aVote && bVote) return aVote - bVote;
                    if (aVote) return -1;
                    if (bVote) return 1;

                    return 0;
                });
            }

            return [...this.shuffledSubmissions].sort((a, b) => (getVote(b) ? 1 : 0) - (getVote(a) ? 1 : 0));
        },
    },
    watch: {
        selectedContest (contest) {
            if (contest) {
                this.shuffledSubmissions = this.shuffle(contest.submissions || []);
                this.startCountdown();
            }
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('communityVote')) {
            this.$store.registerModule('communityVote', communityVoteModule);
        }
    },
    unmounted () {
        if (this.$store.hasModule('communityVote')) {
            this.$store.unregisterModule('communityVote');
        }

        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    },
    async created () {
        await this.loadContests();
    },
    methods: {
        async loadContests(): Promise<void> {
            const id = this.$route.query.contest;

            if (id && !this.contests.length) {
                const contest: any = await this.$http.initialRequest(`/contests/vote/searchContest/${id}`);

                if (!this.$http.isError(contest)) {
                    this.$store.commit('setContests', [contest] || []);
                    this.$store.commit('setSelectedContestId', id);
                    this.shuffledSubmissions = this.shuffle(contest.submissions || []);
                    this.loadedSpecificContest = true;

                    const check: any = await this.$http.executeGet(`/contests/vote/hasOtherContests/${id}`);
                    this.otherContestsExist = !this.$http.isError(check) && check.hasOthers;
                }
            } else {
                this.$router.replace(`/contests/vote`);
                const contests: any = await this.$http.initialRequest('/contests/vote/relevantInfo');

                if (!this.$http.isError(contests)) {
                    this.$store.commit('setContests', contests || []);

                    if (contests.length === 1) {
                        this.$router.replace(`/contests/vote?contest=${contests[0]._id}`);
                        this.$store.commit('setSelectedContestId', contests[0]._id);
                        this.shuffledSubmissions = this.shuffle(contests[0].submissions || []);
                    } else {
                        this.$store.commit('setSelectedContestId', null);
                    }

                    this.loadedSpecificContest = false;
                }
            }
        },
        async loadMore (): Promise<void> {
            await this.loadContests();
        },
        startCountdown (): void {
            if (this.countdownInterval) clearInterval(this.countdownInterval);
            if (!this.selectedContest?.communityVoteEnd) return;

            this.tickCountdown();
            this.countdownInterval = setInterval(() => this.tickCountdown(), 1000);
        },
        tickCountdown (): void {
            const diff = new Date(this.selectedContest.communityVoteEnd).getTime() - Date.now();

            if (diff <= 0) {
                this.countdown = '00:00:00';
                clearInterval(this.countdownInterval!);

                return;
            }

            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            this.countdown = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        },
        shuffle (submissions: any[]): any[] {
            const arr = [...submissions];

            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }

            return arr;
        },
        // i copy pasted this one. too technical for me
        rankLabel (n: number): string {
            if (n === 1) return '1st';
            if (n === 2) return '2nd';
            if (n === 3) return '3rd';

            return n + 'th';
        },
    },
});
</script>

<style scoped>
.text-guild {
    color: var(--guild);
}
</style>
