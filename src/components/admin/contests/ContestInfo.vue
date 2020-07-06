<template>
    <div
        class="container bg-container py-3 mb-2"
    >
        <h5 class="text-center">
            {{ contest.name }}
        </h5>
        <div class="text-center">
            <span>({{ contest.isActive ? 'Screening in progress' : 'Screening completed' }})</span>
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
            :screening-start="contest.screeningStart"
            :judging-start="contest.judgingStart"
            :results-published="contest.resultsPublished"
        />

        <hr>

        <screeners-info
            :contest-id="contest.id"
            :screeners="contest.screeners"
        />

        <judging-info
            :contest-id="contest.id"
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
import ScreenersInfo from './ScreenersInfo.vue';
import JudgingInfo from './JudgingInfo.vue';
import SubmissionsInfo from './SubmissionsInfo.vue';

export default Vue.extend({
    name: 'ContestInfo',
    components: {
        DateInfo,
        ScreenersInfo,
        JudgingInfo,
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
            const isActive = await this.executePost(`/admin/contests/${this.contest.id}/toggleActivity`, {}, e);

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