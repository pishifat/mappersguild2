<template>
    <div class="container bg-container py-3 mb-2">
        <filter-box
            placeholder="quest name..."
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import FilterBox from '../../components/FilterBox.vue';

export default Vue.extend({
    components: {
        FilterBox,
    },
});
</script>
