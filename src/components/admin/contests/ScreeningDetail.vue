<template>
    <div class="p-3">
        <div v-for="evaluation in evaluations" :key="evaluation.id">
            <div>
                <user-link :user="evaluation.screener" />
                ({{ evaluation.vote }})
                <div class="ms-4 small text-white-50" style="word-break: break-word;">
                    {{ evaluation.comment }}
                </div>
            </div>
        </div>
        <div v-if="!evaluations.length">
            No screenings...
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Screening } from '@interfaces/contest/screening';

export default defineComponent({
    name: 'ScreeningDetail',
    props: {
        evaluations: {
            type: Array as PropType<Screening[]>,
            required: true,
        },
    },
});
</script>
