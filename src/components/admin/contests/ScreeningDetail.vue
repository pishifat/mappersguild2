<template>
    <div class="p-3">
        <div v-for="evaluation in evaluations" :key="evaluation.id">
            <div>{{ evaluation.screener.username }}: {{ getVotePlace(evaluation.vote) }} ({{ evaluation.vote }} points)</div>
            <div class="ml-4 small" style="word-break: break-word;">
                {{ evaluation.comment }}
            </div>
        </div>

        <div v-if="!evaluations.length">
            No evaluations...
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ScreeningPlacement } from '../../../../interfaces/contest/screening';

export default Vue.extend({
    name: 'ScreeningDetail',
    props: {
        evaluations: {
            type: Array,
            required: true,
        },
    },
    methods: {
        getVotePlace(vote): string {
            return ScreeningPlacement[vote];
        },
    },
});
</script>
