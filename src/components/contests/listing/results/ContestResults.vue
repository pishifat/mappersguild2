<template>
    <div>
        <div v-if="contest" class="container p-3">
            <h4>{{ contest.name }} results</h4>
            <div>
                <a :href="contest.download" target="_blank">
                    Download all submissions
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
                        <th v-bs-tooltip="'screeners sort entries in their ordered top 5. #1 adds 5 points, #2 adds 4 points, etc.'" scope="col">
                            Screener votes ({{ contest.screeners.length * 5 }})
                        </th>
                        <th v-bs-tooltip="'see results news post for cases where standardized scores affect outcome'" scope="col">
                            Judge scores ({{ maxScore }})
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="submission in contest.submissions" :key="submission.id + 'screen'">
                        <td scope="row">
                            <a :href="'/contests/results?submission=' + submission.id">
                                {{ submission.name }} <i class="fa fa-arrow-right" />
                            </a>
                        </td>
                        <td scope="row">
                            <user-link :user="submission.creator" />
                        </td>
                        <td v-if="contest.judgingThreshold">
                            <span v-for="i in voteCount(submission.evaluations)" :key="i">
                                <i class="fas fa-check text-done me-1" />
                            </span>
                            <span v-if="voteCount(submission.evaluations, true) > 0">
                                ({{ voteCount(submission.evaluations, true) }})
                            </span>
                        </td>
                        <td v-else>
                            N/A
                        </td>
                        <td>
                            <span :class="judgeScore (submission.judgings) > 0 ? 'text-done' : ''">
                                {{ judgeScore (submission.judgings) }}
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

export default defineComponent({
    name: 'ContestResults',
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
    },
    methods: {
        voteCount (evaluations, accuracy): number {
            let count = 0;

            for (const evaluation of evaluations) {
                if (evaluation.vote && !isNaN(evaluation.vote)) {
                    if (accuracy) count += evaluation.vote;
                    else count++;
                }
            }

            return count;
        },
        judgeScore (judgings): number | string {
            let count = 0;

            for (const judging of judgings) {
                for (const judgingScore of judging.judgingScores) {
                    count += judgingScore.score;
                }
            }

            return count == 0 ? 'N/A' : count;
        },
    },
});
</script>
