<template>
    <div class="p-3">
        <div v-for="evaluation in evaluations" :key="evaluation.id">
            <div>{{ evaluation.judge.username }}: {{ getVotePlace(evaluation.vote) }} ({{ evaluation.vote }} points)</div>
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
import { JudgingPlacement } from '../../../../interfaces/contest/judging';

export default Vue.extend({
    name: 'JudgingDetail',
    props: {
        evaluations: {
            type: Array,
            required: true,
        },
    },
    methods: {
        getVotePlace(vote): string {
            return JudgingPlacement[vote];
        },
    },
});
</script>
