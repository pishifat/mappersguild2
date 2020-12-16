<template>
    <div class="small">
        Quest {{ isExpired ? 'expired' : 'expires' }}:
        <span class="text-white-50">
            {{ expiration.toLocaleDateString() }}
        </span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'ExpirationDate',
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
