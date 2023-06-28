<template>
    <small>
        <i class="fas fa-coins me-1" />
        <span
            v-bs-tooltip="'points required from each party member to start quest'"
            class="text-secondary"
        >
            {{ price }}pt{{ price == 1 ? '' : 's' }}
        </span>
    </small>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'QuestPrice',
    props: {
        price: {
            type: Number,
            default: 0,
        },
    },
});
</script>
