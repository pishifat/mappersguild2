<template>
    <small>
        Modes {{ status == 'open' ? 'available' : '' }}:
        <i
            v-if="modes.includes('osu')"
            class="fas fa-circle"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!"
        />
        <i
            v-if="modes.includes('taiko')"
            class="fas fa-drum"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!taiko"
        />
        <i
            v-if="modes.includes('catch')"
            class="fas fa-apple-alt"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!catch"
        />
        <i
            v-if="modes.includes('mania')"
            class="fas fa-stream"
            data-toggle="tooltip"
            data-placement="top"
            title="osu!mania"
        />
    </small>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'QuestModes',
    props: {
        status: {
            type: String,
            required: true,
        },
        modes: {
            type: Array,
            required: true,
        },
    },
});
</script>
