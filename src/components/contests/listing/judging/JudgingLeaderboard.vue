<template>
    <div>
        <div class="row">
            <div class="col-sm">
                Score display:
                <a
                    href="#"
                    :class="displayMode === 'criterias' ? 'border-bottom border-secondary' : ''"
                    @click.prevent="displayMode = 'criterias'"
                >
                    Criteria
                </a>
                |
                <a
                    href="#"
                    :class="displayMode === 'judges' ? 'border-bottom border-secondary' : ''"
                    @click.prevent="displayMode = 'judges'"
                >
                    Judge
                </a>
                |
                <a
                    href="#"
                    :class="displayMode === 'detail' ? 'border-bottom border-secondary' : ''"
                    @click.prevent="displayMode = 'detail'"
                >
                    Judge (SD)
                </a>
            </div>
        </div>
        <div class="row">
            <div class="col-sm">
                <table class="table table-sm small table-responsive-lg">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User</th>
                            <template v-if="displayMode === 'criterias'">
                                <th
                                    v-for="criteria in scoredCriteria"
                                    :key="criteria.id"
                                >
                                    {{ criteria.name }}
                                </th>
                            </template>
                            <template v-else>
                                <th
                                    v-for="judge in judges"
                                    :key="judge.id"
                                >
                                    {{ judge.username }}
                                </th>
                            </template>
                            <th>
                                <a
                                    href="#"
                                    @click.prevent="sortByRawScore"
                                >
                                    Final Score (raw)
                                </a>
                            </th>
                            <th>
                                <a
                                    href="#"
                                    @click.prevent="sortByStdScore"
                                >
                                    Final Score (standardized)
                                </a>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(score, i) in usersScores"
                            :key="i"
                            data-bs-toggle="modal"
                            data-bs-target="#detailModal"
                            @click="selectedScore = score"
                        >
                            <td>{{ i + 1 }}</td>
                            <td><user-link :user="score.creator" /></td>
                            <template v-if="displayMode === 'criterias'">
                                <td v-for="criteria in scoredCriteria" :key="criteria.id">
                                    {{ getCriteriaScore(score, criteria.id) }}
                                </td>
                            </template>
                            <template v-else>
                                <td v-for="judge in judges" :key="judge.id">
                                    {{ getJudgeScore(score, judge.id, displayMode === 'detail') }}
                                </td>
                            </template>

                            <td>{{ score.rawFinalScore }}</td>
                            <td>{{ getFinalScore(score.standardizedFinalScore) }}</td>
                        </tr>

                        <template v-if="displayMode === 'detail'">
                            <tr class="cursor-default">
                                <td />
                                <td>AVG</td>
                                <td v-for="judge in judges" :key="judge.id">
                                    {{ getJudgeAvg(judge.id) }}
                                </td>
                                <td />
                                <td />
                            </tr>
                            <tr class="cursor-default">
                                <td />
                                <td>SD</td>
                                <td v-for="judge in judges" :key="judge.id">
                                    {{ getJudgeSd(judge.id) }}
                                </td>
                                <td />
                                <td />
                            </tr>
                            <tr class="cursor-default">
                                <td />
                                <td>COR</td>
                                <td v-for="judge in judges" :key="judge.id">
                                    {{ getJudgeCorrel(judge.id) }}
                                </td>
                                <td />
                                <td />
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- csv for copy paste. it's formatted stupidly to make spaces correct -->
        <div>Spreadsheet</div>
        <div class="small text-secondary">
            <ol>
                <li>
                    Copy/paste the text below into a text editor
                </li>
                <li>
                    Save the file with a <code>.csv</code> extension
                </li>
                <li>
                    Import the file to Google Drive or Excel for an automatically formatted spreadsheet
                </li>
            </ol>
        </div>
        <copy-paste>
            <div>
                #,User,<span v-if="displayMode === 'criterias'">
                    <span v-for="criteria in scoredCriteria" :key="criteria.id">
                        <span class="text-capitalize">{{ criteria.name + ',' }}</span>
                    </span>
                </span><span v-else><span v-for="judge in judges" :key="judge.id">
                        {{ judge.username + ',' }}
                    </span></span>Final Score<span v-if="!contest.useRawScoring"> (raw),Final Score (standardized)</span>,
            </div>
            <div v-for="(score, i) in usersScores" :key="i">
                {{ i+1 }},{{ score.creator.username }},<span v-if="displayMode === 'criterias'">
                    <span v-for="criteria in scoredCriteria" :key="criteria.id">
                        {{ getCriteriaScore(score, criteria.id) + ',' }}
                    </span>
                </span><span v-else>
                    <span v-for="judge in judges" :key="judge.id">
                        {{ getJudgeScore(score, judge.id, displayMode === 'detail') + ',' }}
                    </span></span>{{ score.rawFinalScore }}<span v-if="!contest.useRawScoring">,{{ getFinalScore(score.standardizedFinalScore) }}</span>,
            </div>
        </copy-paste>

        <div>Markdown</div>
        <div class="small text-secondary">
            Copy/paste this into any <code>.md</code> file
        </div>
        <copy-paste>
        <div>
            | Rank | User
            <span v-if="displayMode === 'criterias'">
                <span v-for="criteria in scoredCriteria" :key="criteria.id">
                    | <span class="text-capitalize">{{ criteria.name }}</span>
                </span>
            </span>
            <span v-else>
                <span v-for="judge in judges" :key="judge.id">
                    | {{ judge.username }}
                </span>
            </span>
            | Final Score<span v-if="!contest.useRawScoring"> (raw) | **Final Score (standardized)**</span> |
        </div>
        <div>
            | :-- | :--
            <span v-if="displayMode === 'criterias'">
                <span v-for="criteria in scoredCriteria" :key="criteria.id">
                    | :--
                </span>
            </span>
            <span v-else>
                <span v-for="judge in judges" :key="judge.id">
                    | :--
                </span>
            </span>
            | :-- | :-- |
        </div>
        <div v-for="(score, i) in usersScores" :key="i">
            | {{ i+1 }} | {{ '[' + score.creator.username + '](' + score.creator.osuId + ')' }}
            <span v-if="displayMode === 'criterias'">
                <span v-for="criteria in scoredCriteria" :key="criteria.id">
                    | {{ getCriteriaScore(score, criteria.id) }}
                </span>
            </span>
            <span v-else>
                <span v-for="judge in judges" :key="judge.id">
                    | {{ getJudgeScore(score, judge.id, displayMode === 'detail') }}
                </span>
            </span>
            | {{ score.rawFinalScore }}<span v-if="!contest.useRawScoring"> | **{{ getFinalScore(score.standardizedFinalScore) }}**</span> |
        </div>
    </copy-paste>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Submission } from '@interfaces/contest/submission';
import { UserScore, JudgeCorrel } from '@interfaces/contest/judging';
import { Contest } from '@interfaces/contest/contest';
import { Criteria } from '@interfaces/contest/criteria';
import { User } from '@interfaces/user';
import CopyPaste from '../../../CopyPaste.vue';

export default defineComponent({
    name: 'JudgingLeaderboard',
    components: {
        CopyPaste,
    },
    props: {
        contest: {
            type: Object as PropType<Contest>,
            required: true,
        },
        usersScores: {
            type: Array as PropType<UserScore[]>,
            required: true,
        },
        judgesCorrel: {
            type: Array as PropType<JudgeCorrel[]>,
            required: true,
        },
    },
    data () {
        return {
            selectedScore: null as UserScore | null,
            displayMode: 'criterias' as 'criterias' | 'judges' | 'detail',
            sortDesc: false,
        };
    },
    computed: {
        scoreDetail (): Submission | undefined {
            if (this.selectedScore) {
                return this.contest.submissions.find(s => s.creator.id == this.selectedScore?.creator.id);
            }

            return undefined;
        },
        scoredCriteria (): Criteria[] {
            return this.contest.criterias.filter(c => c.name !== 'comments');
        },
        judges (): User[] {
            return this.contest.judges;
        },
    },
    methods: {
        getCriteriaScore (score: UserScore, criteriaId: string): number {
            return score.criteriaSum.find(c => c.criteriaId === criteriaId)?.sum || 0;
        },
        getJudgeScore (score: UserScore, judgeId: string, std = false): number | string {
            const judgeScore = score.judgingSum.find(j => j.judgeId === judgeId);
            const stdScore = judgeScore?.standardized || 0;

            if (std) {
                return `${judgeScore?.sum || 0} (${stdScore.toFixed(3)})`;
            }

            return judgeScore?.sum || 0;
        },
        getJudgeAvg (id: string): number | string {
            return this.judgesCorrel.find(j => j.id === id)?.rawAvg.toFixed(4) || 0;
        },
        getJudgeSd (id: string): number | string {
            return this.judgesCorrel.find(j => j.id === id)?.sd.toFixed(4) || 0;
        },
        getJudgeCorrel (id: string): number | string {
            const correl = this.judgesCorrel.find(j => j.id === id)?.correl || 0;

            return correl.toFixed(4);
        },
        getFinalScore (standardizedFinalScore: number): string {
            return isNaN(standardizedFinalScore) ? '0' : standardizedFinalScore.toFixed(4);
        },
        sortByCriteria (criteriaId: number): void {
            this.sortDesc = !this.sortDesc;

            this.$store.commit('sortByCriteria', {
                criteriaId,
                sortDesc: this.sortDesc,
            });
        },
        sortByJudge (judgeId: number): void {
            this.sortDesc = !this.sortDesc;

            this.$store.commit('sortByJudge', {
                judgeId,
                sortDesc: this.sortDesc,
            });
        },
        sortByRawScore (): void {
            this.sortDesc = !this.sortDesc;

            this.$store.commit('sortByRawScore', {
                sortDesc: this.sortDesc,
            });

        },
        sortByStdScore (): void {
            this.sortDesc = !this.sortDesc;

            this.$store.commit('sortByStdScore', {
                sortDesc: this.sortDesc,
            });
        },
    },
});
</script>
