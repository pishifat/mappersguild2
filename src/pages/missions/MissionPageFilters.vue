<template>
    <div class="container card card-body py-3 mb-2">
        <filter-box
            placeholder="filter by quest name..."
            @update:filterValue="updateFilterValue($event)"
        >
            <template #filters>
                <mode-filters
                    :filter-mode="filterMode"
                    @update:filterMode="updateFilterMode($event)"
                />
            </template>
        </filter-box>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FilterBox from '@components/FilterBox.vue';
import ModeFilters from '@components/ModeFilters.vue';
import { mapState, mapActions } from 'vuex';

export default defineComponent({
    name: 'MissionPageFilters',
    components: {
        FilterBox,
        ModeFilters,
    },
    computed: {
        ...mapState('missions', [
            'filterMode',
        ]),
    },
    methods: mapActions('missions', [
        'updateFilterValue',
        'updateFilterMode',
    ]),
});
</script>
