<template>
    <span>
        <i
            v-if="locked"
            class="fas fa-lock fa-xs"
            data-toggle="tooltip"
            data-placement="top"
            title="party is invite-only"
        />
        <i
            v-else
            class="fas fa-unlock fa-xs"
            data-toggle="tooltip"
            data-placement="top"
            title="party is open"
        />
    </span>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        locked: Boolean,
    },
});
</script>
