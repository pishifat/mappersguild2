<template>
    <div
        class="container bg-container py-3 mb-2"
    >
        <h5 class="text-center">
            {{ contest.name }}
            <span class="small">({{ contest.isActive ? 'Judging in-progress' : '' }})</span>
        </h5>

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
import JudgesInfo from './JudgesInfo.vue';
import SubmissionsInfo from './SubmissionsInfo.vue';

export default Vue.extend({
    name: 'ContestInfo',
    components: {
        JudgesInfo,
        SubmissionsInfo,
    },
    props: {
        contest: {
            type: Object as () => Contest,
            required: true,
        },
    },
});
</script>