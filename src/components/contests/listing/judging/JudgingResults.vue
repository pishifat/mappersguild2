<template>
    <div v-if="contest">
        <div class="ms-2 mb-2">
            <a href="#judgeStatuses" data-bs-toggle="collapse" @click.prevent>
                See judging status per submission
                <i class="fas fa-angle-down" />
            </a>
            <judge-statuses
                id="judgeStatuses"
                class="collapse mx-2"
                :contest="contest"
            />
        </div>

        <div class="ms-2 mb-2">
            <a href="#judgingLeaderboard" data-bs-toggle="collapse" @click.prevent>
                See judging leaderboard
                <i class="fas fa-angle-down" />
            </a>
            <judging-leaderboard
                id="judgingLeaderboard"
                class="collapse mx-2"
                :contest-id="contest.id"
                :contest="contest"
                :users-scores="usersScores"
                :judges-correl="judgesCorrel"
            />
        </div>

        <div class="ms-2 mb-2">
            <a href="#markdownJudgingLeaderboard" data-bs-toggle="collapse" @click.prevent>
                See markdown judging leaderboard
                <i class="fas fa-angle-down" />
            </a>
            <markdown-judging-leaderboard
                id="markdownJudgingLeaderboard"
                class="collapse"
                :users-scores="usersScores"
                :contest="contest"
                :judge-count="judgeCount"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import JudgingLeaderboard from './JudgingLeaderboard.vue';
import JudgeStatuses from './JudgeStatuses.vue';
import MarkdownJudgingLeaderboard from './MarkdownJudgingLeaderboard.vue';
import { Contest } from '@interfaces/contest/contest';
import { Submission } from '@interfaces/contest/submission';

export default defineComponent({
    name: 'JudgingResults',
    components: {
        JudgingLeaderboard,
        MarkdownJudgingLeaderboard,
        JudgeStatuses,
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
        };
    },
    computed: {
        judgeCount (): number {
            return this.contest?.judges.length || 0;
        },
    },
    watch: {
        async contestId (): Promise<void> {
            await this.getJudgingResults();
        },
    },
    async created (): Promise<void> {
        await this.getJudgingResults();
    },
    methods: {
        async getJudgingResults (): Promise<void> {
            const data = await this.$http.executeGet<{ contest: Contest; usersScores: []; judgesCorrel: [] }>(`/contests/listing/${this.contestId}/judgingResults`);

            if (!this.$http.isError(data)) {
                this.contest = data.contest;
                this.usersScores = data.usersScores;
                this.judgesCorrel = data.judgesCorrel;
            }
        },
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
