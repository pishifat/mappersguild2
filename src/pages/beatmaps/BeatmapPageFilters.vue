<template>
    <div class="container bg-container py-3 mb-2">
        <filter-box
            placeholder="song/username..."
        >
            <button
                class="btn btn-outline-info"
                href="#"
                data-toggle="modal"
                data-target="#addBeatmap"
            >
                Add beatmap <i class="fas fa-plus small" />
            </button>
        </filter-box>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import FilterBox from '@components/FilterBox.vue';

export default Vue.extend({
    name: 'BeatmapPageFilters',
    components: {
        FilterBox,
    },
});
</script>