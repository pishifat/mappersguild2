<template>
    <div class="container card card-body py-3 mb-2">
        <filter-box
            placeholder="enter to search for quest..."
            @update-filter-value="updateFilterValue($event)"
        >
            <button
                class="btn btn-primary"
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
import { mapActions, mapState } from 'vuex';

export default Vue.extend({
    components: {
        FilterBox,
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        validRank(): boolean {
            return this.loggedInUser.rank >= 1;
        },
    },
    methods: mapActions([
        'updateFilterValue',
    ]),
});
</script>
