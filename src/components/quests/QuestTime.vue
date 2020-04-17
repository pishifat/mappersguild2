<template>
    <small>
        <i class="far fa-clock mr-1" />
        <span
            class="text-white-50"
            data-toggle="tooltip"
            data-placement="top"
            title="days to complete the quest"
        >{{ Math.round(timeframe / (1000*60*60*24)) }} days</span>
    </small>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'QuestTime',
    props: {
        timeframe: {
            type: Number,
            required: true,
        },
    },
});
</script>
