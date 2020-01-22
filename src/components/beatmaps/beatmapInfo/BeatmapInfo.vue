<template>
    <div v-if="selectedBeatmap" class="container">
        <div class="row">
            <!-- LEFT SIDE -->
            <div :class="(isHost && !isRanked && !isQualified) ? 'col-lg-7' : 'col-sm-12'">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <modders-list
                            :can-edit="!isHost && !isRanked"
                            @update:info="info = $event"
                        />
                    </div>

                    <div v-if="!isRanked || selectedBeatmap.bns" id="bns" class="col-sm-6">
                        <nominators-list
                            :can-edit="!isHost && !isRanked"
                            @update:info="info = $event"
                        />
                    </div>
                </div>

                <hr>

                <div class="row">
                    <div class="col-sm">
                        <!-- tasks options -->
                        <tasks-choice
                            @update:info="info = $event"
                        />
                    </div>
                </div>
            </div>

            <!-- RIGHT SIDE -->
            <!-- host options -->
            <div v-if="isHost && !isRanked && !isQualified" class="col-lg-5 bm-col-separator-left">
                <div class="row mb-2">
                    <div class="col-sm">
                        <mode-choice
                            @update:info="info = $event"
                        />
                    </div>
                </div>

                <div class="row mb-2">
                    <div class="col-sm">
                        <status-choice
                            @update:info="info = $event"
                        />
                    </div>
                </div>

                <quest-choice
                    @update:info="info = $event"
                />

                <beatmap-link
                    @update:info="info = $event"
                />

                <locks-choice
                    v-if="selectedBeatmap.status == 'WIP'"
                    @update:info="info = $event"
                />
            </div>
        </div>

        <hr>

        <div class="row">
            <div class="col-sm">
                <span class="errors">
                    {{ info }}
                </span>
            </div>

            <div class="col-sm text-right">
                <span class="small text-white-50">
                    Created: {{ selectedBeatmap.createdAt.slice(0, 10) }}
                </span>
                <button
                    v-if="isHost && !isRanked"
                    id="deleteButton"
                    class="btn btn-sm btn-outline-danger ml-2"
                    @click="deleteMap($event)"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import ModeChoice from './ModeChoice.vue';
import StatusChoice from './StatusChoice.vue';
import TasksChoice from './TasksChoice.vue';
import QuestChoice from './QuestChoice.vue';
import ModdersList from './ModdersList.vue';
import NominatorsList from './NominatorsList.vue';
import BeatmapLink from './BeatmapLink.vue';
import LocksChoice from './LocksChoice.vue';

export default Vue.extend({
    name: 'BeatmapInfo',
    components: {
        ModeChoice,
        StatusChoice,
        TasksChoice,
        QuestChoice,
        ModdersList,
        NominatorsList,
        BeatmapLink,
        LocksChoice,
    },
    data () {
        return {
            userQuests: null,
        };
    },
    computed: {
        ...mapState([
            'selectedBeatmap',
            'userOsuId',
        ]),
        ...mapGetters([
            'isHost',
            'isRanked',
            'isQualified',
        ]),
    },
    watch: {
        selectedBeatmap(): void {
            this.info = '';
        },
    },
    methods: {
        async deleteMap(e): Promise<void> {
            const result = confirm(`Are you sure you want to delete?`);

            if (result) {
                e.target.disabled = true;
                const bm = await this.executePost('/beatmaps/delete/' + this.selectedBeatmap.id, {}, e);

                if (bm) {
                    ($('#editBeatmap') as any).modal('hide');
                    this.$store.commit('deleteBeatmap', bm);
                }

                e.target.disabled = false;
            }
        },
    },
});
</script>

<style>
@media (min-width: 992px) {
    .bm-col-separator-left {
        border-left: 3px solid rgba(100, 88, 88, 0.42);
    }
}

.fake-button-disable {
    pointer-events: none;
    opacity: 0.6;
}
</style>
