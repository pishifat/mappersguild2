<template>
    <div>
        <div v-if="contest">
            <judging-leaderboard
                :contest="contest"
                :users-scores="usersScores"
                :judges-correl="judgesCorrel"
                :criterias="criterias"
            />

            <div class="container">
                <table
                    v-if="contest.submissions.length"
                    class="table table-sm table-hover table-responsive-lg"
                >
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Count</th>
                            <th>Judges</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="submission in contest.submissions"
                            :key="submission.id"
                            data-toggle="modal"
                            data-target="#detailModalAdmin"
                            @click="selected = submission"
                        >
                            <td>
                                {{ `${submission.creator.username} (${submission.name || 'Not anonymized'})` }}
                            </td>
                            <td
                                :class="getJudgesInvolvedCount(submission) >= judgeCount ? 'text-success' : 'text-danger'"
                            >
                                {{ getJudgesInvolvedCount(submission) }} done of {{ judgeCount }}
                            </td>
                            <td>{{ getJudgesInvolved(submission) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <markdown-judging-leaderboard
                :users-scores="usersScores"
                :contest="contest"
                :judge-count="judgeCount"
            />

            <judging-detail
                id="detailModalAdmin"
                :submission="selected"
            />
        </div>
        <div v-else class="text-white-50">
            Loading...
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import JudgingDetail from './JudgingDetail.vue';
import JudgingLeaderboard from './JudgingLeaderboard.vue';
import MarkdownJudgingLeaderboard from './MarkdownJudgingLeaderboard.vue';
import { Contest } from '../../../../interfaces/contest/contest';
import { Submission } from '../../../../interfaces/contest/submission';

export default Vue.extend({
    name: 'JudgingResults',
    components: {
        JudgingDetail,
        JudgingLeaderboard,
        MarkdownJudgingLeaderboard,
    },
    props: {
        contestId: {
            type: String,
            required: true,
        },
    },
    data () {
        return {
            contest: null as Contest | null,
            selected: null as Submission | null,
            usersScores: [],
            judgesCorrel: [],
            criterias: [],
        };
    },
    computed: {
        judgeCount (): number {
            return this.contest?.judges.length || 0;
        },
    },
    async created (): Promise<void> {
        const data = await this.executeGet<{ contest: Contest; usersScores: []; judgesCorrel: []; criterias: [] }>(`/admin/judging/${this.contestId}`);

        if (!this.isError(data)) {
            this.contest = data.contest;
            this.usersScores = data.usersScores;
            this.judgesCorrel = data.judgesCorrel;
            this.criterias = data.criterias;
        }
    },
    methods: {
        getJudgesInvolvedCount (submission: Submission): number {
            const judges = submission.judgings.map(j => j.judge);

            return judges.length;
        },

        getJudgesInvolved (submission: Submission): string {
            const judges = submission.judgings.map(j => j.judge.username);

            return judges.join(', ');
        },

        getSubmissionIdByCreatorId (creatorId: string): string {
            const submission = this.contest?.submissions.find(s => s.creator.id === creatorId);

            return submission!.id;
        },
    },
});
</script>
