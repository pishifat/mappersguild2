<template>
    <div
        class="container bg-container py-3 mb-2"
    >
        <h5 class="text-center">
            {{ contest.name }}
        </h5>
        <div class="text-center">
            <span>({{ contest.isActive ? 'Judging in progress' : 'Judging completed' }})</span>
            <button
                type="button"
                class="btn btn-sm btn-outline-info"
                @click="toggleActivity($event)"
            >
                Mark {{ contest.isActive ? 'inactive' : 'active' }}
            </button>
        </div>

        <hr>

        <date-info
            :contest-id="contest.id"
            :contest-start="contest.contestStart"
            :judging-start="contest.judgingStart"
            :results-published="contest.resultsPublished"
        />

        <hr>

        <judges-info
            :contest-id="contest.id"
            :judges="contest.judges"
        />

        <hr>

        <submissions-info
            :contest-id="contest.id"
            :submissions="contest.submissions"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Contest } from '../../../../interfaces/contest/contest';
import DateInfo from './DateInfo.vue';
import JudgesInfo from './JudgesInfo.vue';
import SubmissionsInfo from './SubmissionsInfo.vue';

export default Vue.extend({
    name: 'ContestInfo',
    components: {
        DateInfo,
        JudgesInfo,
        SubmissionsInfo,
    },
    props: {
        contest: {
            type: Object as () => Contest,
            required: true,
        },
    },
    methods: {
        async toggleActivity(e): Promise<void> {
            const isActive = await this.executePost(`/admin/contests/${this.contest.id}/contests/toggleActivity`, {}, e);

            if (!this.isError(isActive)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled contest activity`,
                    type: 'info',
                });
                this.$store.commit('toggleActivity', {
                    contestId: this.contest.id,
                    isActive,
                });
            }
        },
    },
});
</script>