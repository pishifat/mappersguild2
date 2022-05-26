<template>
    <div>
        <div v-if="submission" class="container p-3">
            <div>
                <h3>
                    <a :href="'/contests/results?contest=' + submission.contest.id">
                        <i class="fa fa-arrow-left" /> {{ submission.contest.name }}
                    </a>
                </h3>
                <h4>
                    Submission by <user-link :user="submission.creator" />
                </h4>
                <h5>
                    Anonymized as "{{ submission.name }}"
                </h5>
                <div v-if="loggedInUser && loggedInUser.id == submission.creator.id">
                    <a href="#" @click.prevent="$store.commit('setSubmission', null)">
                        Your other contest submissions
                    </a>
                </div>

                <div v-if="submission.contest.download" class="mt-2">
                    <div>
                        <a :href="submission.contest.download" target="_blank">
                            Download all submissions
                        </a>
                    </div>
                </div>
            </div>

            <hr>

            <div class="mx-2">
                <h5>
                    Screening results
                </h5>
                <div v-if="submission.screenings && submission.screenings.length">
                    <p class="ms-3">
                        Comments are usually each screener's initial thoughts. They're not intended to be constructive feedback and many screeners use comments as notes for determining their top 5.
                    </p>
                    <div v-for="(evaluation, i) in randomizedScreening" :key="evaluation.id">
                        <div>
                            <div class="ms-3">
                                User {{ i+1 }}
                                <i
                                    v-if="evaluation.vote"
                                    v-bs-tooltip="'user placed in top 5'"
                                    class="fas fa-check text-done"
                                />
                            </div>
                            <div class="ms-4 mb-2 small text-white-50" style="word-break: break-word;">
                                {{ evaluation.comment ? evaluation.comment : '[no comment]' }}
                            </div>
                        </div>
                    </div>
                    <div v-for="i in emptyEvaluationCount" :key="i">
                        <div>
                            <div class="ms-3">
                                User {{ submission.screenings.length + i }}
                            </div>
                            <div class="ms-4 mb-2 small text-white-50" style="word-break: break-word;">
                                [no comment]
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="ms-3">
                    This contest skipped screening.
                </div>
            </div>

            <hr>

            <div class="mx-2">
                <h5>
                    Judging results
                </h5>
                <div v-if="submission.judgings && submission.judgings.length">
                    <div v-for="(judging, i) in randomizedJudging" :key="judging.id">
                        <div>
                            <p class="ms-3">
                                User {{ i+1 }}
                            </p>
                            <div class="row ms-3">
                                <div class="col-sm-5">
                                    <table class="table table-sm table-responsive-sm">
                                        <thead>
                                            <tr>
                                                <th class="text-start">
                                                    Category
                                                </th>
                                                <th class="text-start">
                                                    Score
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="judgingScore in filteredAndSortedJudgingScores(judging.judgingScores)" :key="judgingScore.id">
                                                <td class="text-start text-capitalize">
                                                    {{ judgingScore.criteria.name }}
                                                </td>
                                                <td class="text-start">
                                                    {{ judgingScore.score }}/{{ judgingScore.criteria.maxScore }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="text-start">
                                                    TOTAL
                                                </td>
                                                <td class="text-start">
                                                    {{ findTotalJudgingPoints(judging.judgingScores) }}/{{ findTotalCriteriaPoints(judging.judgingScores) }}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="col-sm-7 small">
                                    Comment:
                                    <span class="text-white-50" style="white-space: pre-line;">
                                        {{ findJudgeComment (judging.judgingScores) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="ms-3">
                    This entry did not receive enough screening votes to reach the judging stage. :(
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Submission } from '@interfaces/contest/submission';
import { Judging } from '@interfaces/contest/judging';
import { Screening } from '@interfaces/contest/screening';

export default defineComponent({
    name: 'SubmissionResult',
    computed: {
        ...mapState({
            submission: (state: any) => state.contestResults.submission as Submission,
            loggedInUser: (state: any) => state.loggedInUser,
        }),
        voteCount (): number {
            let count = 0;

            this.submission.screenings.forEach(screening => {
                if (!isNaN(screening.vote)) count += screening.vote;
            });

            return count;
        },
        emptyEvaluationCount (): number {
            return this.submission.contest.screeners.length - this.submission.screenings.length;
        },
        randomizedJudging (): Judging[] {
            let judgings = [...this.submission.judgings];
            judgings = judgings.sort(() => Math.random() - 0.5); // doesn't need to be pure random

            return judgings;
        },
        randomizedScreening (): Screening[] {
            let screenings = [...this.submission.screenings];
            screenings = screenings.sort(() => Math.random() - 0.5); // doesn't need to be pure random

            return screenings;
        },
    },
    methods: {
        findTotalJudgingPoints (judgingScores) {
            let total = 0;

            judgingScores.forEach(judgingScore => {
                total += judgingScore.score;
            });

            return total;
        },
        findTotalCriteriaPoints (judgingScores) {
            let total = 0;

            judgingScores.forEach(judgingScore => {
                total += judgingScore.criteria.maxScore;
            });

            return total;
        },
        findJudgeComment (judgingScores) {
            let comment = '';

            judgingScores.forEach(judgingScore => {
                if (judgingScore.criteria.name == 'comments') {
                    comment = judgingScore.comment;
                }
            });

            return comment;
        },
        filteredAndSortedJudgingScores (judgingScores) {
            judgingScores = judgingScores.filter(j => j.criteria.name != 'comments');

            const sortOrder = ['musical representation', 'creativity', 'limitation', 'gameplay'];

            return [...judgingScores].sort(function(a, b) {
                return sortOrder.indexOf(a.criteria.name) - sortOrder.indexOf(b.criteria.name);
            });
        },
    },
});
</script>
