<template>
    <div v-cloak>
        <p>
            Listing of all the scores you set in each entry.
        </p>
        <div>When editing you need to add a comment for each criteria in addition to the score</div>
        <small>(if you don't save and close this window or start editing another entry, the changes will be lost!)</small>

        <div class="row mb-2">
            <div class="col-sm">
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">
                            {{ contest.name }}
                        </h4>
                    </div>
                    <div class="card-body p-0">
                        <table class="table table-hover table-responsive-sm">
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
                                    <td v-for="criteria in criterias" :key="criteria.id">
                                        <a
                                            href="#"
                                            class="d-flex align-items-center justify-content-center"
                                            data-toggle="modal"
                                            data-target="#editing-judging-modal"
                                            @click.prevent="selectForEditing(submission, criteria)"
                                        >
                                            <i class="mr-1 fas fa-edit" />
                                            {{ getScore(submission.id, criteria.id) + `/ ${criteria.maxScore}` }}
                                        </a>
                                    </td>
                                    <td>
                                        {{ getTotalScore(submission.id) }} / {{ maxPossibleScore }}
                                    </td>
                                    <td>
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

        <div
            v-if="editingCriteria"
            id="editing-judging-modal"
            tabindex="-1"
            class="modal fade"
            data-backdrop="static"
            data-keyboard="false"
        >
            <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
                <div class="modal-content bg-dark">
                    <div
                        v-if="alertInfo"
                        class="alert"
                        :class="(alertSuccess ? 'alert-success' : 'alert-danger')"
                        role="alert"
                    >
                        {{ alertInfo }}
                    </div>
                    <div class="modal-header">
                        <h5
                            id="exampleModalLongTitle"
                            class="modal-title"
                        >
                            Editing  <b>{{ editingCriteria.name }}</b> for <b>{{ editingSubmission.anonymisedAs }}</b>
                        </h5>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="score">Score</label>
                            <input
                                id="score"
                                v-model="editingScore"
                                type="number"
                                step="1"
                                min="0"
                                :max="editingCriteria.maxScore"
                                class="form-control"
                            >
                        </div>
                        <div
                            class="form-group"
                        >
                            <label for="comment">
                                Comment
                            </label>
                            <textarea
                                id="comment"
                                v-model="editingComment"
                                maxlength="3000"
                                rows="15"
                                class="form-control"
                            />
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button
                            type="button"
                            class="btn btn-secondary"
                            @click.prevent="closeModal()"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            class="btn btn-primary"
                            @click.prevent="save($event)"
                        >
                            Save changes
                        </button>
                        <div id="close-button" data-dismiss="modal" />
                    </div>
                </div>
            </div>
        </div>

        <toast-messages />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import ToastMessages from '@components/ToastMessages.vue';
import { Contest } from '../../interfaces/contest/contest';
import { Criteria } from '../../interfaces/contest/criteria';
import { Submission } from '../../interfaces/contest/submission';
import { Judging } from '../../interfaces/contest/judging';
import { JudgingScore } from '../../interfaces/contest/judgingScore';

export default Vue.extend({
    name: 'JudgingPage',
    components: {
        ToastMessages,
    },
    data () {
        return {
            contest: {} as Contest,
            judgingDone: [] as Judging[],
            criterias: [] as Criteria[],
            editingSubmission: null as Submission | null,
            editingCriteria: null as Criteria | null,
            editingScore: 0,
            editingComment: '',
            alertInfo: '',
            alertSuccess: false,
            sortBy: 'name',
            sortByCriteria: '',
            sortDesc: false,

        };
    },
    computed: {
        sortedSubmissions (): Submission[] {
            const submissions = this.contest.submissions;
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
        const data = await this.executeGet<{ contest: Contest; criterias: Criteria[]; judgingDone: Judging[] }>('/judging/relevantInfo');

        if (!this.isError(data)) {
            this.contest = data.contest;
            this.criterias = data.criterias;
            this.judgingDone = data.judgingDone;
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
    },
    methods: {
        selectForEditing (submission: Submission, criteria: Criteria): void {
            this.editingSubmission = submission;
            this.editingCriteria = criteria;
            this.editingScore = 0;
            this.editingComment = '';
            this.alertInfo = '';
            this.alertSuccess = false;

            const judgingToCriterias = this.getJudgingToCriterias(submission.id, criteria.id);

            if (judgingToCriterias) {
                this.editingComment = judgingToCriterias.comment;
                this.editingScore = judgingToCriterias.score;
            }
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

        async save (e: any): Promise<void> {
            this.alertInfo = '';
            const data = await this.executePost<{ success?: string; error?: string; judgingDone: [] }>('/judging/save', {
                submissionId: this.editingSubmission?.id,
                criteriaId: this.editingCriteria?.id,
                score: this.editingScore,
                comment: this.editingComment,
            }, e);

            if (this.isError(data)) return;

            this.alertInfo = data.success || data.error || '';
            this.alertSuccess = data.success != undefined;

            if (!this.alertSuccess)
                return;

            this.judgingDone = data.judgingDone;
        },

        closeModal(): void {
            document.getElementById('close-button')?.click();
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