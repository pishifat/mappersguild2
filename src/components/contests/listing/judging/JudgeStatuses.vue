<template>
    <div>
        <table
            class="table table-sm table-responsive-lg small"
        >
            <thead>
                <tr>
                    <th>User</th>
                    <th>Count</th>
                    <th>Incomplete judges</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="submission in contest.submissions"
                    :key="submission.id"
                    data-bs-toggle="modal"
                    data-bs-target="#detailModalAdmin"
                    class="modalable"
                    @click="selected = submission"
                >
                    <td>
                        <user-link :user="submission.creator" />
                    </td>
                    <td
                        :class="getJudgesInvolvedCount(submission) >= judgeCount ? 'text-success' : 'text-danger'"
                    >
                        {{ getJudgesInvolvedCount(submission) }}/{{ judgeCount }}
                    </td>
                    <td>{{ getMissingJudges(submission) }}</td>
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
import { defineComponent, PropType } from 'vue';
import JudgingDetail from './JudgingDetail.vue';
import { Contest } from '@interfaces/contest/contest';
import { User } from '@interfaces/user';
import { Submission } from '@interfaces/contest/submission';

export default defineComponent({
    name: 'JudgeStatuses',
    components: {
        JudgingDetail,
    },
    props: {
        contest: {
            type: Object as PropType<Contest>,
            required: true,
        },
    },
    data () {
        return {
            selected: null as Submission | null,
        };
    },
    computed: {
        judgeCount (): number {
            return this.contest?.judges.length || 0;
        },
    },
    methods: {
        getJudgesInvolvedCount (submission: Submission): number {
            const judges = submission.judgings.map(j => j.judge);

            return judges.length;
        },
        getMissingJudges (submission: Submission): string {
            const judgeIds = submission.judgings.map(j => j.judge.id);
            const missingJudges: User[] = [];

            for (const judge of this.contest.judges) {
                if (!judgeIds.includes(judge.id)) {
                    missingJudges.push(judge);
                } else {
                    const judging = submission.judgings.find(j => j.judge.id === judge.id);

                    if (judging && judging.judgingScores.length !== this.contest.criterias.length) {
                        missingJudges.push(judge);
                    }
                }
            }

            const missingJudgeUsernames = missingJudges.map(j => j.username);

            return missingJudgeUsernames.join(', ');
        },

        getSubmissionIdByCreatorId (creatorId: string): string {
            const submission = this.contest?.submissions.find(s => s.creator.id === creatorId);

            return submission!.id;
        },
    },
});
</script>

<style scoped>

.modalable:hover {
    cursor: pointer;
}

</style>