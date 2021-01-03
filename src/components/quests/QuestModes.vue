<template>
    <small>
        {{ status == 'open' ? 'Modes available' : 'Modes' }}:
        <i
            v-if="modes.includes('osu')"
            class="fas fa-circle"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="osu!"
        />
        <i
            v-if="modes.includes('taiko')"
            class="fas fa-drum"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="osu!taiko"
        />
        <i
            v-if="modes.includes('catch')"
            class="fas fa-apple-alt"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="osu!catch"
        />
        <i
            v-if="modes.includes('mania')"
            class="fas fa-stream"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="osu!mania"
        />
    </small>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
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
