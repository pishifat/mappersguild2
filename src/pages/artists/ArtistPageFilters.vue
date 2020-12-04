<template>
    <div class="container card card-body py-3 mb-2">
        <filter-box
            placeholder="artist..."
            @update-filter-value="updateFilterValue($event)"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import FilterBox from '@components/FilterBox.vue';
import { mapActions } from 'vuex';

export default Vue.extend({
    name: 'ArtistPageFilters',
    components: {
        FilterBox,
    },
    methods: mapActions([
        'updateFilterValue',
    ]),
});
</script>
