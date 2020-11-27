<template>
    <div v-cloak>
        <div v-if="contest" class="row mb-2">
            <div class="col-sm">
                <div class="card">
                    <div class="card-header">
                        <h4 class="text-center my-2">
                            {{ contest.name }}
                        </h4>
                    </div>
                    <div class="card-body p-0">
                        <table class="table table-responsive-sm">
                            <thead>
                                <tr>
                                    <th class="text-left">
                                        <a
                                            href="#"
                                            @click.prevent="sortSubmissionsBy('name')"
                                        >
                                            Entry's Name
                                        </a>
                                    </th>
                                    <th v-for="criteria in criterias" :key="criteria.id">
                                        <a
                                            href="#"
                                            class="text-capitalize"
                                            @click.prevent="sortSubmissionsBy('criteria', criteria.id)"
                                        >
                                            {{ criteria.name }}
                                        </a>
                                    </th>
                                    <th>
                                        <a
                                            href="#"
                                            @click.prevent="sortSubmissionsBy('total')"
                                        >
                                            Total
                                        </a>
                                    </th>
                                    <th>
                                        <a
                                            href="#"
                                            @click.prevent="sortSubmissionsBy('completed')"
                                        >
                                            Completed
                                        </a>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="submission in sortedSubmissions" :key="submission.id">
                                    <td class="text-left">
                                        {{ submission.name }}
                                    </td>
                                    <td v-for="criteria in criterias" :key="criteria.id" class="text-left">
                                        <a
                                            href="#"
                                            data-toggle="modal"
                                            data-target="#editing-judging-modal"
                                            @click.prevent="selectForEditing(submission.id, criteria.id)"
                                        >
                                            <i class="mr-1 fas fa-edit" />
                                            <span v-if="criteria.name != 'comments'">
                                                {{ getScore(submission.id, criteria.id) + `/${criteria.maxScore}` }}
                                            </span>
                                        </a>
                                    </td>
                                    <td>
                                        {{ getTotalScore(submission.id) }}/{{ maxPossibleScore }}
                                    </td>
                                    <td class="text-center">
                                        <i
                                            class="fa"
                                            :class="isCompleted(submission.id) ? 'fa-check text-success' : 'fa-times text-danger'"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <editing-criteria-modal />

        <toast-messages />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import ToastMessages from '@components/ToastMessages.vue';
import EditingCriteriaModal from '@components/judging/EditingCriteriaModal.vue';
import { Contest } from '../../interfaces/contest/contest';
import { Criteria } from '../../interfaces/contest/criteria';
import { Submission } from '../../interfaces/contest/submission';
import { Judging } from '../../interfaces/contest/judging';
import { JudgingScore } from '../../interfaces/contest/judgingScore';
import { mapState } from 'vuex';

export default Vue.extend({
    name: 'JudgingPage',
    components: {
        ToastMessages,
        EditingCriteriaModal,
    },
    data () {
        return {
            sortBy: 'name',
            sortByCriteria: '',
            sortDesc: false,

        };
    },
    computed: {
        ...mapState([
            'contest',
            'criterias',
            'judgingDone',
        ]),
        filteredSubmissions (): Submission[] {
            const filteredSubmissions: any = [...this.contest.submissions];

            for (let i = 0; i < filteredSubmissions.length; i++) {
                const submission = filteredSubmissions[i];
                const total = submission.evaluations.reduce((acc, e) => {
                    if (e.vote) {
                        return acc + e.vote;
                    }

                    return acc;
                }, 0);
                filteredSubmissions[i].total = total;
            }

            return this.contest.submissions.filter(s => s.total >= this.contest.judgingThreshold);
        },
        sortedSubmissions (): Submission[] {
            const submissions = this.filteredSubmissions;
            if (!submissions) return [];

            if (this.sortBy === 'name') {
                submissions.sort((a, b) => {
                    const anomA = a.name?.toUpperCase();
                    const anomB = b.name?.toUpperCase();

                    if (anomA < anomB) return this.sortDesc ? -1 : 1;
                    if (anomA > anomB) return this.sortDesc ? 1 : -1;

                    return 0;
                });
            } else if (this.sortBy === 'total') {
                submissions.sort((a, b) => {
                    const aValue = this.getTotalScore(a.id);
                    const bValue = this.getTotalScore(b.id);

                    if (this.sortDesc) {
                        return aValue - bValue;
                    }

                    return bValue - aValue;
                });
            } else if (this.sortBy === 'criteria') {
                submissions.sort((a, b) => {
                    const aValue = this.getScore(a.id, this.sortByCriteria);
                    const bValue = this.getScore(b.id, this.sortByCriteria);

                    if (this.sortDesc) {
                        return aValue - bValue;
                    }

                    return bValue - aValue;
                });
            } else if (this.sortBy === 'completed') {
                submissions.sort((a, b) => {
                    const aValue = this.isCompleted(a.id);
                    const bValue = this.isCompleted(b.id);

                    if (aValue === bValue) return 0;

                    if (this.sortDesc) {
                        return aValue ? 1 : -1;
                    }

                    return aValue ? -1 : 1;
                });
            }

            return submissions;
        },

        maxPossibleScore (): number {
            return this.criterias.reduce((acc, c) => c.maxScore + acc, 0);
        },
    },
    async created () {
        const res = await this.executeGet<{ contest: Contest; criterias: Criteria[]; judgingDone: Judging[] }>('/judging/relevantInfo');

        if (!this.isError(res)) {
            this.$store.commit('setContest', res.contest);
            this.$store.commit('setCriterias', res.criterias);
            this.$store.commit('setJudgingDone', res.judgingDone);
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
    },
    methods: {
        selectForEditing (submissionId: Submission['id'], criteriaId: Criteria['id']): void {
            this.$store.commit('setEditingSubmissionId', submissionId);
            this.$store.commit('setEditingCriteriaId', criteriaId);
        },
        getJudgingToCriterias(submissionId: string, criteriaId: string): JudgingScore | null {
            const judging = this.judgingDone.find(j => j.submission.id === submissionId);
            if (!judging)
                return null;

            const judgingScore = judging.judgingScores.find((q) => q.criteria.id === criteriaId);
            if (!judgingScore)
                return null;

            return judgingScore;
        },
        getScore(submissionId: string, criteriaId: string): number {
            const qualifierJudgingToCriterias = this.getJudgingToCriterias(submissionId, criteriaId);
            if (!qualifierJudgingToCriterias)
                return 0;

            return qualifierJudgingToCriterias.score;
        },
        getTotalScore(submissionId: string): number {
            const judging = this.judgingDone.find(j => j.submission.id === submissionId);

            if (!judging)
                return 0;

            return judging.judgingScores.reduce((acc, j) => j.score + acc, 0);
        },
        isCompleted(submissionId: string): boolean {
            const judging = this.judgingDone.find(j => j.submission.id === submissionId);
            if (!judging)
                return false;

            return judging.judgingScores.length === this.criterias.length;
        },
        sortSubmissionsBy (type: string, criteriaId?: string): void {
            this.sortBy = type;
            this.sortDesc = !this.sortDesc;

            if (type === 'criteria' && criteriaId) {
                this.sortByCriteria = criteriaId;
            }
        },
    },
});
</script>

<style scoped>

.card {
    transform: none;
}

</style>