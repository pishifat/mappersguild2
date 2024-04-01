<template>
    <modal-dialog
        id="editing-judging-modal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        :loaded="Boolean(editingSubmission)"
    >
        <template #header>
            {{ editingSubmission.name }}: <span class="text-capitalize">{{ editingCriteria.name }}</span>
        </template>

        <template #default>
            <div v-if="editingCriteria.name != 'comments'" class="mb-3">
                <label class="form-label" for="score">Score</label>
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
                v-else
                class="mb-3"
            >
                <label class="form-label" for="comment">
                    Comment
                </label>
                <textarea
                    id="comment"
                    v-model="editingComment"
                    maxlength="3000"
                    rows="4"
                    class="form-control"
                />
            </div>
        </template>

        <template #footer>
            <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                @click.prevent="closeModal()"
            >
                Close
            </button>
            <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click.prevent="save($event)"
            >
                Save changes
            </button>
            <div id="close-button" data-bs-dismiss="modal" />
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { JudgingScore } from '../../../interfaces/contest/judgingScore';
import { mapState, mapGetters } from 'vuex';
import ModalDialog from '@components/ModalDialog.vue';

export default defineComponent({
    name: 'EditingCriteriaModal',
    components: {
        ModalDialog,
    },
    data () {
        return {
            editingScore: 0,
            editingComment: '',
        };
    },
    computed: {
        ...mapState({
            selectedContestId: (state: any) => state.judging.selectedContestId,
            judgingDone: (state: any) => state.judging.judgingDone,
        }),
        ...mapGetters([
            'editingSubmission',
            'editingCriteria',
        ]),
    },
    watch: {
        editingSubmission(): void {
            this.getUserInput();
        },
        editingCriteria(): void {
            this.getUserInput();
        },
    },
    methods: {
        getUserInput(): void {
            if (this.editingSubmission) {
                const judgingToCriterias = this.getJudgingToCriterias(this.editingSubmission.id, this.editingCriteria.id);

                if (judgingToCriterias) {
                    this.editingScore = judgingToCriterias.score;
                    this.editingComment = judgingToCriterias.comment;
                } else {
                    this.editingScore = 0;
                    this.editingComment = '';
                }
            }
        },
        getJudgingToCriterias(submissionId: string, criteriaId: string): JudgingScore | null {
            const judging = this.judgingDone.find(j => j.submission.id && j.submission.id === submissionId);
            if (!judging)
                return null;

            const judgingScore = judging.judgingScores.find((q) => q.criteria.id && q.criteria.id === criteriaId);
            if (!judgingScore)
                return null;

            return judgingScore;
        },
        async save (e: any): Promise<void> {
            const res = await this.$http.executePost<{ success?: string; error?: string; judgingDone: [] }>('/contests/judging/save', {
                submissionId: this.editingSubmission?.id,
                criteriaId: this.editingCriteria?.id,
                score: this.editingScore,
                comment: this.editingComment,
            }, e);

            if (this.$http.isError(res)) return;

            this.$store.commit('setJudgingDone', res.judgingDone);

            this.$store.dispatch('updateToastMessages', {
                message: res.success,
                type: 'info',
            });
        },
        closeModal(): void {
            document.getElementById('close-button')?.click();
        },
    },
});
</script>