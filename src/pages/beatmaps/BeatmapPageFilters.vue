<template>
    <div class="container card card-body py-3 mb-2">
        <filter-box
            placeholder="enter to search for song/username..."
            :filter-value="filterValue"
            @update-filter-value="updateFilterValue($event)"
        >
            <button
                class="btn btn-primary"
                href="#"
                data-toggle="modal"
                data-target="#addBeatmap"
            >
                Add beatmap <i class="fas fa-plus small" />
            </button>

            <template #filters>
                <div class="row mt-3">
                    <div class="col-auto filter-title">
                        Status
                    </div>
                    <div class="col">
                        <a
                            v-for="(statusText, status) in statuses"
                            :key="status"
                            href="#"
                            class="status"
                            :class="getStatusSortClass(status)"
                            @click.prevent="updateFilterStatus(status)"
                        >
                            {{ statusText }}
                        </a>
                    </div>
                </div>

                <div class="row mt-3">
                    <div class="col-auto filter-title">
                        Quest
                    </div>
                    <div class="col">
                        <a
                            v-for="(questText, quest) in quests"
                            :key="quest"
                            href="#"
                            class="quest"
                            :class="getQuestSortClass(quest)"
                            @click.prevent="updateFilterQuest(quest)"
                        >
                            {{ questText }}
                        </a>
                    </div>
                </div>
            </template>
        </filter-box>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import FilterBox from '@components/FilterBox.vue';
import { mapActions, mapState } from 'vuex';

export default Vue.extend({
    name: 'BeatmapPageFilters',
    components: {
        FilterBox,
    },
    data () {
        return {
            statuses: {
                any: 'Any',
                wip: 'WIP',
                done: 'Done',
                qualified: 'Qualified',
                ranked: 'Ranked',
            },
            quests: {
                any: 'Any',
                none: 'None',
            },
        };
    },
    computed: mapState([
        'filterMode',
        'filterValue',
        'filterStatus',
        'filterQuest',
    ]),
    methods: {
        ...mapActions('beatmaps', [
            'updateFilterValue',
            'updateFilterMode',
        ]),
        getStatusSortClass(status: string): 'sorted' | 'unsorted' {
            if (this.filterStatus === status) {
                return 'sorted';
            }

            return 'unsorted';
        },
        getQuestSortClass(quest: 'any' | 'none'): 'sorted' | 'unsorted' {
            if (this.filterQuest === quest) {
                return 'sorted';
            }

            return 'unsorted';
        },
    },
});
</script>