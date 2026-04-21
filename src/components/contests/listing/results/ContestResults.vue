<template>
    <div>
        <div v-if="contest" class="container p-3">
            <h4>
                <a v-if="contest.url || contest.resultsUrl" :href="contest.resultsUrl ? contest.resultsUrl : contest.url" target="_blank">
                    {{ contest.name }} results
                </a>
                <span v-else>{{ contest.name }} results</span>
            </h4>
            <div>
                <a :href="contest.download" target="_blank">
                    Download all submissions ({{ contest.submissions.length }})
                </a>
            </div>
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th
                            scope="col"
                            class="sortable"
                            @click="setSort('name')"
                        >
                            <span v-bs-tooltip="'anonymized name seen by screeners/judges'">Submission</span> <i v-if="activeSort.key === 'name'" class="fas ms-1" :class="activeSort.asc ? 'fa-arrow-up' : 'fa-arrow-down'" />
                        </th>
                        <th
                            scope="col"
                            class="sortable"
                            @click="setSort('creator')"
                        >
                            Creator <i v-if="activeSort.key === 'creator'" class="fas ms-1" :class="activeSort.asc ? 'fa-arrow-up' : 'fa-arrow-down'" />
                        </th>
                        <th
                            v-if="hasScreening"
                            scope="col"
                            class="sortable"
                            @click="setSort('screening')"
                        >
                            <span v-bs-tooltip="`screeners sort entries in their ordered top ${contest.screeningVoteCount}. #1 adds ${contest.screeningVoteCount} points, #2 adds ${contest.screeningVoteCount-1} points, #3 adds ${contest.screeningVoteCount-2}, etc.`">Screener votes ({{ contest.screeners.length * contest.screeningVoteCount }})</span> <i v-if="activeSort.key === 'screening'" class="fas ms-1" :class="activeSort.asc ? 'fa-arrow-up' : 'fa-arrow-down'" />
                        </th>
                        <th
                            v-if="hasCommunityVotes"
                            scope="col"
                            class="sortable"
                            @click="setSort('communityRaw')"
                        >
                            Raw votes <i v-if="activeSort.key === 'communityRaw'" class="fas ms-1" :class="activeSort.asc ? 'fa-arrow-up' : 'fa-arrow-down'" />
                        </th>
                        <th
                            v-if="hasCommunityVotes && contest.communityVoteOrderedPriority"
                            scope="col"
                            class="sortable"
                            @click="setSort('communityWeighted')"
                        >
                            <span v-bs-tooltip="'Weighted votes based on priority order'">Weighted votes</span> <i v-if="activeSort.key === 'communityWeighted'" class="fas ms-1" :class="activeSort.asc ? 'fa-arrow-up' : 'fa-arrow-down'" />
                        </th>
                        <th
                            v-if="hasJudging"
                            scope="col"
                            class="sortable"
                            @click="setSort('raw')"
                        >
                            Raw scores ({{ maxScore }}) <i v-if="activeSort.key === 'raw'" class="fas ms-1" :class="activeSort.asc ? 'fa-arrow-up' : 'fa-arrow-down'" />
                        </th>
                        <th
                            v-if="hasJudging && !contest.useRawScoring"
                            scope="col"
                            class="sortable"
                            @click="setSort('standardized')"
                        >
                            <span v-bs-tooltip="`judge X's final score = (judge X's raw score - judge X's average raw score) / judge X's standard deviation`">Standardized scores</span> <i v-if="activeSort.key === 'standardized'" class="fas ms-1" :class="activeSort.asc ? 'fa-arrow-up' : 'fa-arrow-down'" />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="submission in sortedSubmissions" :key="submission.id + 'screen'">
                        <td scope="row">
                            <a :href="'/contests/results?submission=' + submission.id">
                                {{ submission.name }} <i class="fa fa-arrow-right" />
                            </a>
                        </td>
                        <td scope="row">
                            <user-link :user="submission.creator" />
                        </td>
                        <td v-if="hasScreening">
                            <span v-for="i in voteCount(submission.screenings)" :key="i">
                                <i class="fas fa-check text-done me-1" />
                            </span>
                            <span v-if="voteCount(submission.screenings, true) > 0">
                                ({{ voteCount(submission.screenings, true) }})
                            </span>
                        </td>
                        <td v-if="hasCommunityVotes">
                            {{ rawVoteCount(submission.communityVotes) }}
                        </td>
                        <td v-if="hasCommunityVotes && contest.communityVoteOrderedPriority">
                            {{ weightedVoteScore(submission.communityVotes) }}
                        </td>
                        <td v-if="hasJudging">
                            <span :class="contest.useRawScoring && judgeScore (submission.judgings) > 0 ? 'text-done' : ''">
                                {{ judgeScore (submission.judgings) || 'N/A' }}
                            </span>
                        </td>
                        <td v-if="hasJudging && !contest.useRawScoring">
                            <span :class="judgeScore (submission.judgings) > 0 ? 'text-done' : ''">
                                <div v-if="!usersScores.length">calculating...</div>
                                <div v-else>{{ getFinalScore (submission.id) || 'N/A' }}</div>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Contest } from '@interfaces/contest/contest';
import { Submission } from '@interfaces/contest/submission';
import { ContestResultsSortKey as SortKey } from '@interfaces/extras';

export default defineComponent({
    name: 'ContestResults',
    data () {
        return {
            usersScores: [] as any,
            sortKey: null as SortKey | null,
            sortAsc: true,
        };
    },
    computed: {
        ...mapState({
            contest: (state: any) => state.contestResults.contest as Contest,
        }),
        hasScreening (): boolean {
            return this.contest.screeners && this.contest.screeners.length > 0;
        },
        hasJudging (): boolean {
            return this.contest.judges && this.contest.judges.length > 0;
        },
        hasCommunityVotes (): boolean {
            return this.contest.submissions.some(s => s.communityVotes && s.communityVotes.length);
        },
        maxScore (): number {
            let count = 0;

            for (const criteria of this.contest.criterias) {
                count += criteria.maxScore;
            }

            return count * this.contest.judges.length;
        },
        defaultSortKey (): SortKey {
            if (this.hasCommunityVotes && !this.hasScreening && !this.hasJudging) {
                return this.contest.communityVoteOrderedPriority ? 'communityWeighted' : 'communityRaw';
            }

            if (this.hasJudging && !this.contest.useRawScoring) return 'standardized';
            if (this.hasJudging) return 'raw';
            if (this.hasScreening) return 'screening';

            return 'name';
        },
        activeSort (): { key: SortKey; asc: boolean } {
            return { key: this.sortKey ?? this.defaultSortKey, asc: this.sortKey ? this.sortAsc : false };
        },
        sortedSubmissions (): Submission[] {
            const { key, asc } = this.activeSort;
            const dir = asc ? 1 : -1;

            const getValue = (s: Submission): string | number | null => {
                if (key === 'name') return s.name.toLowerCase();
                if (key === 'creator') return (s.creator as any).username.toLowerCase();
                if (key === 'screening') return this.voteCount(s.screenings, true);
                if (key === 'communityRaw') return this.rawVoteCount(s.communityVotes);
                if (key === 'communityWeighted') return this.weightedVoteScore(s.communityVotes);
                if (key === 'raw') return this.judgeScore(s.judgings);
                if (key === 'standardized') return (s.judgings && s.judgings.length) ? this.getFinalScore(s.id) : null;

                return 0;
            };

            return [...this.contest.submissions].sort((a, b) => {
                const aVal = getValue(a);
                const bVal = getValue(b);

                if (aVal === null && bVal === null) return 0;
                if (aVal === null) return 1;
                if (bVal === null) return -1;

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return aVal.localeCompare(bVal) * dir;
                }

                return ((aVal as number) - (bVal as number)) * dir;
            });
        },
    },
    async created () {
        const data: any = await this.$http.executeGet(`/contests/listing/${this.contest.id}/getUsersScores`);

        if (!this.$http.isError(data)) {
            this.usersScores = data.usersScores;
        }
    },
    methods: {
        setSort (key: SortKey): void {
            if (this.sortKey === key) {
                this.sortAsc = !this.sortAsc;
            } else {
                this.sortKey = key;
                this.sortAsc = key === 'name' || key === 'creator';
            }
        },
        voteCount (screenings, accuracy): number {
            let count = 0;

            for (const screening of screenings) {
                if (screening.vote && !isNaN(screening.vote)) {
                    if (accuracy) count += screening.vote;
                    else count++;
                }
            }

            return count;
        },
        judgeScore (judgings): number {
            let count = 0;

            for (const judging of judgings) {
                for (const judgingScore of judging.judgingScores) {
                    count += judgingScore.score;
                }
            }

            return count;
        },
        rawVoteCount (communityVotes): number {
            return (communityVotes || []).filter(v => v.vote > 0).length;
        },
        weightedVoteScore (communityVotes): number {
            return (communityVotes || []).reduce((acc, v) => acc + (v.vote > 0 ? this.contest.communityVoteCount + 1 - v.vote : 0), 0);
        },
        getFinalScore (id: string): number {
            const score = this.usersScores.find(s => s.submissionId == id);

            if (score) {
                return isNaN(score.standardizedFinalScore) ? 0 : parseFloat(score.standardizedFinalScore.toFixed(4));
            }

            return 0;
        },
    },
});
</script>

<style scoped>
.sortable {
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
}
.sortable:hover {
    color: rgba(255, 255, 255, 0.6);
}
</style>
