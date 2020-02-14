<template>
    <div
        class="container bg-container py-3 mb-2"
    >
        <h5>
            {{ contest.name }}
            <input
                v-model.number="judgeOsuId"
                class="form-control-sm"
                type="number"
                autocomplete="off"
                placeholder="new judge's osuId..."
                @keyup.enter="addJudge($event)"
            >
        </h5>

        <hr>

        Submissions:

        <table v-if="contest.submissions.length" class="table table-hover">
            <tr
                v-for="submission in contest.submissions"
                :key="submission.id"
            >
                <td>{{ submission.name }}</td>
                <td>{{ submission.creator }}</td>
            </tr>
        </table>

        <span v-else>None...</span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Contest } from '../../../../interfaces/contest/contest';

export default Vue.extend({
    name: 'ContestInfo',
    props: {
        contest: {
            type: Object as () => Contest,
            required: true,
        },
    },
    data () {
        return {
            judgeOsuId: null,
        };
    },
    methods: {
        async addJudge(e): Promise<void> {
            const contest = await this.executePost(`/admin/contests/${this.contest}/addJudge`, { osuId: this.judgeOsuId }, e);

            if (!this.isError(contest)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `added ${this.judgeOsuId} (${this.contest.judges.length})`,
                    type: 'info',
                });
                this.$store.dispatch('updateSubmission', contest);
            }
        },
    },
});
</script>