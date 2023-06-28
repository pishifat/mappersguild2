<template>
    <small>
        <i class="far fa-clock me-1" />
        <span
            v-bs-tooltip="'days to complete the quest'"
            class="text-secondary"
        >{{ Math.round(timeframe / (1000*60*60*24)) }} days</span>
    </small>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'QuestTime',
    props: {
        timeframe: {
            type: Number,
            required: true,
        },
    },
});
</script>
