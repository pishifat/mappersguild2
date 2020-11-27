<template>
    <div>
        <div v-if="submission" class="container bg-container p-3">
            <div class="text-center">
                <h4>
                    {{ submission.contest.name }}
                </h4>
                <h5 data-toggle="tooltip" title="anonymized submission name">
                    {{ submission.name }}
                </h5>
                <p>
                    created by
                    <a :href="'https://osu.ppy.sh/users/' + submission.creator.osuId" target="_blank">
                        {{ submission.creator.username }}
                    </a>
                </p>
            </div>

            <hr>

            <div class="mx-2">
                <h5>
                    Screening results
                </h5>
                <p class="ml-3">
                    Comments are usually each screener's initial thoughts. They're not intended to be constructive feedback and many screeners use comments as notes for determining their top 5.
                </p>
                <div v-for="(evaluation, i) in randomizedScreening" :key="evaluation.id">
                    <div>
                        <div class="ml-3">
                            User {{ i+1 }}
                            <i
                                v-if="evaluation.vote"
                                data-toggle="tooltip"
                                title="user placed in top 5"
                                class="fas fa-check icon-valid"
                            />
                        </div>
                        <div class="ml-4 mb-2 small text-white-50" style="word-break: break-word;">
                            {{ evaluation.comment ? evaluation.comment : '[no comment]' }}
                        </div>
                    </div>
                </div>
                <div v-for="i in emptyEvaluationCount" :key="i">
                    <div>
                        <div class="ml-3">
                            User {{ submission.evaluations.length + i }}
                        </div>
                        <div class="ml-4 mb-2 small text-white-50" style="word-break: break-word;">
                            [no comment]
                        </div>
                    </div>
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
                            <p class="ml-3">
                                User {{ i+1 }}
                            </p>
                            <div class="row">
                                <table class="col-sm-5 ml-4 table table-sm table-responsive-sm">
                                    <thead>
                                        <tr>
                                            <th class="text-left">
                                                Category
                                            </th>
                                            <th class="text-left">
                                                Score
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="judgingScore in filteredAndSortedJudgingScores(judging.judgingScores)" :key="judgingScore.id">
                                            <td class="text-left text-capitalize">
                                                {{ judgingScore.criteria.name }}
                                            </td>
                                            <td class="text-left">
                                                {{ judgingScore.score }}/{{ judgingScore.criteria.maxScore }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="text-left">
                                                TOTAL
                                            </td>
                                            <td class="text-left">
                                                {{ findTotalJudgingPoints(judging.judgingScores) }}/{{ findTotalCriteriaPoints(judging.judgingScores) }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="col-sm-6 small">
                                    Comment:
                                    <span class="text-white-50" style="white-space: pre-line;">
                                        {{ findJudgeComment (judging.judgingScores) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="ml-3">
                    This entry did not receive enough screening votes to reach the judging stage. :(
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Submission } from '../../interfaces/contest/submission';
import { Judging } from '../../interfaces/contest/judging';
import { Screening } from '../../interfaces/contest/screening';
import { mapState } from 'vuex';

export default Vue.extend({
    name: 'ContestResultsPage',
    computed: {
        ...mapState([
            'submission',
        ]),
        voteCount (): number {
            let count = 0;

            this.submission.evaluations.forEach(evaluation => {
                if (!isNaN(evaluation.vote)) count += evaluation.vote;
            });

            return count;
        },
        emptyEvaluationCount (): number {
            return this.submission.contest.screeners.length - this.submission.evaluations.length;
        },
        randomizedJudging (): Judging[] {
            let judgings = [...this.submission.judgings];
            judgings = judgings.sort(() => Math.random() - 0.5); // doesn't need to be pure random

            return judgings;
        },
        randomizedScreening (): Screening[] {
            let screenings = [...this.submission.evaluations];
            screenings = screenings.sort(() => Math.random() - 0.5); // doesn't need to be pure random

            return screenings;
        },
    },
    async created () {
        const params: any = new URLSearchParams(document.location.search.substring(1));
        let submission;

        if (params.get('submission') && params.get('submission').length) {
            submission = await this.executeGet<{ submission: Submission }>('/contestResults/searchSubmission/' + params.get('submission'));
        }

        if (!submission || this.isError(submission)) {
            window.location.replace('/');
        } else {
            this.$store.commit('setSubmission', submission);
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
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

<style>
</style>