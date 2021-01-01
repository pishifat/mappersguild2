<template>
    <span>
        <i
            v-if="party.lock"
            class="fas fa-lock fa-sm"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="party is invite-only"
        />
        <i
            v-else
            class="fas fa-unlock fa-sm"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="party is open"
        />
    </span>
</template>

<script lang="ts">
import Vue from 'vue';
import { Party } from '@interfaces/party';
import partyInfoMixin from './partyInfoMixin';

export default Vue.extend({
    mixins: [ partyInfoMixin ],
    props: {
        party: {
            type: Object as () => Party,
            required: true,
        },
    },
});
</script>
