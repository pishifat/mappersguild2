<template>
    <span>
        <i
            v-if="party.lock"
            v-bs-tooltip="'party is invite-only'"
            class="fas fa-lock fa-sm"
        />
        <i
            v-else
            v-bs-tooltip="'party is open'"
            class="fas fa-unlock fa-sm"
        />
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Party } from '@interfaces/party';
import partyInfoMixin from './partyInfoMixin';

export default defineComponent({
    mixins: [ partyInfoMixin ],
    props: {
        party: {
            type: Object as () => Party,
            required: true,
        },
    },
});
</script>
