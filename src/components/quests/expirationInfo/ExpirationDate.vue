<template>
    <div class="small">
        Quest {{ isExpired ? 'expired' : 'expires' }}:
        <span class="text-secondary">
            {{ expiration.toLocaleDateString() }}
        </span>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'ExpirationDate',
    props: {
        isExpired: {
            type: Boolean,
            required: true,
        },
        expiration: {
            type: Date as PropType<Date>,
            required: true,
        },
    },
});
</script>
