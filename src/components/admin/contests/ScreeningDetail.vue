<template>
    <div class="p-3">
        <div v-for="evaluation in evaluations" :key="evaluation.id">
            <div>
                <a :href="'https://osu.ppy.sh/users/' + evaluation.screener.osuId" target="_blank">
                    {{ evaluation.screener.username }}
                </a>
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
import Vue from 'vue';

export default Vue.extend({
    name: 'ScreeningDetail',
    props: {
        evaluations: {
            type: Array,
            required: true,
        },
    },
});
</script>
