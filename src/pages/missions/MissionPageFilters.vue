<template>
    <div class="container card card-body py-3 mb-2">
        <filter-box
            placeholder="name..."
            @update:filterValue="updateFilterValue($event)"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FilterBox from '@components/FilterBox.vue';
import { mapActions } from 'vuex';

export default defineComponent({
    name: 'MissionPageFilters',
    components: {
        FilterBox,
    },
    methods: mapActions('missions', [
        'updateFilterValue',
    ]),
});
</script>
