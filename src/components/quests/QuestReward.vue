<template>
    <small>
        <i class="fas fa-award mr-1" />
        <span
            class="text-white-50"
            data-toggle="tooltip"
            data-placement="top"
            title="flat points bonus per user, additional ~2 points per difficulty"
        >
            {{ reward }}pt{{ reward > 1 ? 's' : '' }}
        </span>
    </small>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'QuestReward',
    props: {
        reward: {
            type: Number,
            required: true,
        },
    },
});
</script>
