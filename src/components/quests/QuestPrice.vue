<template>
    <small>
        <i class="fas fa-coins mr-1" />
        <span
            class="text-white-50"
            data-toggle="tooltip"
            data-placement="top"
            title="points required from each party member to start quest"
        >
            {{ price }}pt{{ price == 1 ? '' : 's' }}
        </span>
    </small>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'QuestPrice',
    props: {
        price: {
            type: Number,
            default: 0,
        },
    },
});
</script>
