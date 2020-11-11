<template>
    <div class="container bg-container py-3 mb-2">
        <filter-box
            placeholder="enter to search for quest..."
        >
            <button
                class="btn btn-outline-info"
                :disabled="!validRank"
                href="#"
                :data-toggle="validRank ? 'modal' : 'tooltip'"
                :title="!validRank ? 'designing custom quests is available to tier 1+ users only' : ''"
                :data-target="validRank ? '#submitQuest' : ''"
            >
                Submit quest for approval <i class="fas fa-plus small" />
            </button>
        </filter-box>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import FilterBox from '../../components/FilterBox.vue';
import { mapState } from 'vuex';

export default Vue.extend({
    components: {
        FilterBox,
    },
    computed: {
        ...mapState([
            'userRank',
        ]),
        validRank(): boolean {
            return this.userRank >= 1;
        },
    },
});
</script>
