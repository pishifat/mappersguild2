<template>
    <small>
        Modes:
        <modes-icons
            :modes="modes"
            color="secondary"
        />
    </small>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModesIcons from '@components/ModesIcons.vue';

export default defineComponent({
    name: 'QuestModes',
    components: { ModesIcons },
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
