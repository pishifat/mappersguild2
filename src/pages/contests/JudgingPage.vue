<template>
    <div class="container card card-body py-1">
        <div v-if="contests && contests.length" class="row">
            <contest-card
                v-for="contest in contests"
                :key="contest.id"
                class="col-sm-4 my-2"
                :contest="contest"
                :route="'judging'"
            />
            <div v-if="loadedSpecificContest" class="col-sm-4 my-2">
                <button
                    class="btn w-100 btn-info h-100"
                    type="button"
                    @click="loadMore()"
                >
                    Load other contests
                </button>
            </div>
            <div v-if="selectedContest">
                <hr>

                <div class="card">
                    <h4 class="my-2">
                        {{ selectedContest.name }}
                    </h4>
                    <h5>
                        <a :href="selectedContest.download" target="_blank">
                            Download all submissions
                        </a>
                    </h5>

                    <div class="mb-2">
                        <a href="#judgingInstructions" data-bs-toggle="collapse" @click.prevent>
                            See judging instructions
                            <i class="fas fa-angle-down" />
                        </a>
                    </div>

                    <judging-instructions
                        id="judgingInstructions"
                        class="collapse"
                    />

                    <div class="card-body p-0 mt-2">
                        <table class="table table-responsive-sm mb-0">
                            <thead>
                                <tr>
                                    <th class="text-start">
                                        <a
                                            href="#"
                                            @click.prevent="sortSubmissionsBy('name')"
                                        >
                                            Entry's Name
                                        </a>
                                    </th>
                                    <th v-for="criteria in selectedContest.criterias" :key="criteria.id">
                                        <a
                                            href="#"
                                            class="text-start"
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
                                    <td class="text-start">
                                        {{ submission.name }}
                                    </td>
                                    <td v-for="criteria in selectedContest.criterias" :key="criteria.id" class="text-start">
                                        <a
                                            href="#"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editing-judging-modal"
                                            @click.prevent="selectForEditing(submission.id, criteria.id)"
                                        >
                                            <span v-if="criteria.name != 'comments'">
                                                {{ getScore(submission.id, criteria.id) + `/${criteria.maxScore}` }}
                                            </span>
                                            <span v-else>{{ getComment(submission.id) }}</span>
                                            <i class="ms-1 fas fa-edit" />
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
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import ContestCard from '@components/contests/ContestCard.vue';
import EditingCriteriaModal from '@components/judging/EditingCriteriaModal.vue';
import JudgingInstructions from '@components/judging/JudgingInstructions.vue';
import { Contest } from '@interfaces/contest/contest';
import { Criteria } from '@interfaces/contest/criteria';
import { Submission } from '@interfaces/contest/submission';
import { Judging } from '@interfaces/contest/judging';
import { JudgingScore } from '@interfaces/contest/judgingScore';
import judgingModule from '@store/judging';

export default defineComponent({
    name: 'JudgingPage',
    components: {
        EditingCriteriaModal,
        ContestCard,
        JudgingInstructions,
    },
    data () {
        return {
            sortBy: 'name',
            sortByCriteria: '',
            sortDesc: false,
            loadedSpecificContest: false,
        };
    },
    computed: {
        ...mapState({
            contests: (state: any) => state.judging.contests,
            judgingDone: (state: any) => state.judging.judgingDone,
        }),
        ...mapGetters([
            'selectedContest',
        ]),
        filteredSubmissions (): Submission[] {
            const indexes: number[] = [];

            for (let i = 0; i < this.selectedContest.submissions.length; i++) {
                const submission = this.selectedContest.submissions[i];
                const total = submission.screenings.reduce((acc, e) => {
                    if (e.vote) {
                        return acc + e.vote;
                    }

                    return acc;
                }, 0);

                if (total >= this.selectedContest.judgingThreshold) {
                    indexes.push(i);
                }
            }

            const filteredSubmissions: any[] = [];

            for (const i of indexes) {
                filteredSubmissions.push(this.selectedContest.submissions[i]);
            }

            return filteredSubmissions;
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
            return this.selectedContest.criterias.reduce((acc, c) => c.maxScore + acc, 0);
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('judging')) {
            this.$store.registerModule('judging', judgingModule);
        }
    },
    unmounted () {
        if (this.$store.hasModule('judging')) {
            this.$store.unregisterModule('judging');
        }
    },
    async created () {
        await this.loadContests();
    },
    methods: {
        async loadContests(): Promise<void> {
            const id = this.$route.query.contest;

            if (id && !this.contests.length) {
                const res: any = await this.$http.initialRequest(`/contests/judging/searchContest/${id}`);

                if (!this.$http.isError(res)) {
                    this.$store.commit('setContests', [res.contest] || []);
                    this.$store.commit('setSelectedContestId', id);
                    this.$store.commit('setJudgingDone', res.judgingDone);

                    this.loadedSpecificContest = true;
                }
            } else {
                this.$router.replace(`/contests/judging`);
                const res: any = await this.$http.initialRequest<{ contests: Contest[]; judgingDone: Judging[] }>('/contests/judging/relevantInfo');

                if (!this.$http.isError(res)) {
                    this.$store.commit('setContests', res.contests);
                    this.$store.commit('setSelectedContestId', null);
                    this.$store.commit('setJudgingDone', res.judgingDone);

                    this.loadedSpecificContest = false;
                }
            }
        },
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

            return judging.judgingScores.length === this.selectedContest.criterias.length;
        },
        sortSubmissionsBy (type: string, criteriaId?: string): void {
            this.sortBy = type;
            this.sortDesc = !this.sortDesc;

            if (type === 'criteria' && criteriaId) {
                this.sortByCriteria = criteriaId;
            }
        },
        async loadMore (): Promise<void> {
            await this.loadContests();
        },
        getComment (submissionId: string): string {
            const judging = this.judgingDone.find(j => j.submission.id === submissionId);
            if (!judging) return '...';

            console.log(judging);

            let comment = '...';

            for (const score of judging.judgingScores) {
                if (score.comment && score.comment.length) {
                    comment = score.comment.length > 10 ? score.comment.slice(0,10) + '...' : score.comment;
                }
            }

            return comment;
        },
    },
});
</script>
