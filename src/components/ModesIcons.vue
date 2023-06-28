<template>
    <template v-if="toggler">
        <a class="mode-margin" href="#" @click.prevent="$emit('toggle', 'osu')">
            <i
                v-bs-tooltip="'toggle osu!'"
                class="fas fa-circle"
                :class="modes.includes('osu') ? '' : 'text-secondary'"
            />
        </a>
        <a class="mode-margin" href="#" @click.prevent="$emit('toggle', 'taiko')">
            <i
                v-bs-tooltip="'toggle osu!taiko'"
                class="fas fa-drum"
                :class="modes.includes('taiko') ? '' : 'text-secondary'"
            />
        </a>
        <a class="mode-margin" href="#" @click.prevent="$emit('toggle', 'catch')">
            <i
                v-bs-tooltip="'toggle osu!catch'"
                class="fas fa-apple-alt"
                :class="modes.includes('catch') ? '' : 'text-secondary'"
            />
        </a>
        <a class="mode-margin" href="#" @click.prevent="$emit('toggle', 'mania')">
            <i
                v-bs-tooltip="'toggle osu!'"
                class="fas fa-stream"
                :class="modes.includes('mania') ? '' : 'text-secondary'"
            />
        </a>
    </template>
    <template v-else>
        <i
            v-if="modes.includes('osu')"
            v-bs-tooltip="'osu!'"
            class="fas fa-circle mode-margin"
        />
        <i
            v-if="modes.includes('taiko')"
            v-bs-tooltip="'osu!taiko'"
            class="fas fa-drum mode-margin"
        />
        <i
            v-if="modes.includes('catch')"
            v-bs-tooltip="'osu!catch'"
            class="fas fa-apple-alt mode-margin"
        />
        <i
            v-if="modes.includes('mania')"
            v-bs-tooltip="'osu!mania'"
            class="fas fa-stream mode-margin"
        />
        <i
            v-if="modes.includes('hybrid')"
            v-bs-tooltip="'multiple game modes'"
            class="fas fa-check-double mode-margin"
        />
    </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ModesIcons',
    props: {
        modes: {
            type: Array,
            required: true,
        },
        toggler: Boolean,
    },
    emits: [
        'toggle',
    ],
});
</script>

<style>

.mode-margin {
    margin-left: 1px;
    margin-right: 1px;
}

</style>