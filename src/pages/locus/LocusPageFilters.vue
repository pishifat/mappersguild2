<template>
    <div class="container card card-body py-3 mb-2">
        <filter-box
            placeholder="search user, language, or anything else..."
            @update:filterValue="updateFilterValue($event)"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FilterBox from '@components/FilterBox.vue';
import { mapActions } from 'vuex';

export default defineComponent({
    name: 'LocusPageFilters',
    components: {
        FilterBox,
    },
    methods: mapActions('locus', [
        'updateFilterValue',
    ]),
});
</script>
