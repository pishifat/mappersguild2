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
                        <th v-bs-tooltip="'anonymized name seen by screeners/judges'" scope="col">
                            Submission
                        </th>
                        <th scope="col">
                            Creator
                        </th>
                        <th v-if="contest.judgingThreshold" v-bs-tooltip="`screeners sort entries in their ordered top ${contest.screeningVoteCount}. #1 adds ${contest.screeningVoteCount} points, #2 adds ${contest.screeningVoteCount-1} points, #3 adds ${contest.screeningVoteCount-2}, etc.`" scope="col">
                            Screener votes ({{ contest.screeners.length * contest.screeningVoteCount }})
                        </th>
                        <th scope="col">
                            Raw scores ({{ maxScore }})
                        </th>
                        <th v-if="!contest.useRawScoring" v-bs-tooltip="`judge X's final score = (judge X's raw score - judge X's average raw score) / judge X's standard deviation`" scope="col">
                            Standardized scores
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
                        <td v-if="contest.judgingThreshold">
                            <span v-for="i in voteCount(submission.screenings)" :key="i">
                                <i class="fas fa-check text-done me-1" />
                            </span>
                            <span v-if="voteCount(submission.screenings, true) > 0">
                                ({{ voteCount(submission.screenings, true) }})
                            </span>
                        </td>
                        <td>
                            <span :class="contest.useRawScoring && judgeScore (submission.judgings) > 0 ? 'text-done' : ''">
                                {{ judgeScore (submission.judgings) || 'N/A' }}
                            </span>
                        </td>
                        <td v-if="!contest.useRawScoring">
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

export default defineComponent({
    name: 'ContestResults',
    data () {
        return {
            usersScores: [] as any,
        };
    },
    computed: {
        ...mapState({
            contest: (state: any) => state.contestResults.contest as Contest,
        }),
        maxScore (): number {
            let count = 0;

            for (const criteria of this.contest.criterias) {
                count += criteria.maxScore;
            }

            return count * this.contest.judges.length;
        },
        sortedSubmissions (): Submission[] {
            if (this.contest.useRawScoring) {
                return [...this.contest.submissions].sort((a, b) => {
                    const aValue = this.judgeScore(a.judgings);
                    const bValue = this.judgeScore(b.judgings);

                    return bValue - aValue;
                });
            } else {
                const judgedSubmissions = [...this.contest.submissions.filter(s => s.judgings && s.judgings.length)].sort((a, b) => {
                    const aValue = this.getFinalScore(a.id);
                    const bValue = this.getFinalScore(b.id);

                    return bValue - aValue;
                });

                const allSubmissions = judgedSubmissions.concat([...this.contest.submissions.filter(s => !s.judgings || (s.judgings && !s.judgings.length))]);

                return allSubmissions;
            }

        },
    },
    async created () {
        const data: any = await this.$http.executeGet(`/contests/listing/${this.contest.id}/getUsersScores`);

        if (!this.$http.isError(data)) {
            this.usersScores = data.usersScores;
        }
    },
    methods: {
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
