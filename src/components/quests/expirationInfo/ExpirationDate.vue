<template>
    <p class="small">
        Quest {{ isExpired ? 'expired' : 'expires' }}:
        <span class="text-white-50">
            {{ expiration.toLocaleDateString() }}
        </span>
    </p>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        isExpired: {
            type: Boolean,
            required: true,
        },
        expiration: {
            type: Date,
            required: true,
        },
    },
});
</script>
