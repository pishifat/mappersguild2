<template>
    <div v-if="contest" class="container">
        <judging-leaderboard
            :contest="contest"
            :users-scores="usersScores"
            :judges-correl="judgesCorrel"
            :criterias="criterias"
        />

        <table
            v-if="contest.submissions.length"
            class="table table-hover table-responsive-lg"
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

        <judging-detail
            id="detailModalAdmin"
            :submission="selected"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import JudgingDetail from './JudgingDetail.vue';
import JudgingLeaderboard from './JudgingLeaderboard.vue';
import { Contest } from '../../../../interfaces/contest/contest';
import { Submission } from '../../../../interfaces/contest/submission';

export default Vue.extend({
    name: 'JudgingInfo',
    components: {
        JudgingDetail,
        JudgingLeaderboard,
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
    },
});
</script>
