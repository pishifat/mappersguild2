<template>
    <div v-if="beatmap" class="container">
        <div class="row">
            <!-- LEFT SIDE -->
            <div :class="(isHost && !isRanked && !isQualified) ? 'col-lg-7' : 'col-sm-12'">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <modders-list
                            :beatmap="beatmap"
                            :can-edit="!isHost && !isRanked"
                        />
                    </div>

                    <div v-if="!isRanked || beatmap.bns" id="bns" class="col-sm-6">
                        <nominators-list
                            :beatmap="beatmap"
                            :can-edit="!isHost && !isRanked"
                        />
                    </div>
                </div>

                <hr>

                <div class="row">
                    <div class="col-sm">
                        <!-- tasks options -->
                        <tasks-choice
                            :beatmap="beatmap"
                            :is-host="isHost"
                            :is-ranked="isRanked"
                            :is-qualified="isQualified"
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
                            :beatmap="beatmap"
                        />
                    </div>
                </div>

                <div class="row mb-2">
                    <div class="col-sm">
                        <status-choice
                            :beatmap="beatmap"
                        />
                    </div>
                </div>

                <quest-choice
                    :beatmap="beatmap"
                />

                <beatmap-link
                    :beatmap="beatmap"
                />

                <locks-choice
                    v-if="beatmap.status == 'WIP'"
                    :beatmap="beatmap"
                />
            </div>
        </div>

        <hr>

        <div class="row">
            <!-- points calculation -->
            <points
                class="col-sm-8"
                :beatmap="beatmap"
            />

            <div class="col-sm-4 text-right">
                <span class="small text-white-50">
                    Created: {{ beatmap.createdAt.toString().slice(0, 10) }}
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
import { mapState } from 'vuex';
import ModeChoice from './ModeChoice.vue';
import StatusChoice from './StatusChoice.vue';
import TasksChoice from './TasksChoice.vue';
import QuestChoice from './QuestChoice.vue';
import ModdersList from './ModdersList.vue';
import NominatorsList from './NominatorsList.vue';
import BeatmapLink from './BeatmapLink.vue';
import LocksChoice from './LocksChoice.vue';
import Points from './Points.vue';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';

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
        Points,
    },
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    data () {
        return {
            userQuests: null,
        };
    },
    computed: {
        ...mapState([
            'userOsuId',
        ]),
        isHost(): boolean {
            if (this.userOsuId && this.beatmap) {
                return this.userOsuId === this.beatmap.host.osuId;
            }

            return false;
        },
        isRanked(): boolean {
            return this.beatmap.status === 'Ranked';
        },
        isQualified(): boolean {
            return this.beatmap.status === 'Qualified';
        },
    },
    methods: {
        async deleteMap(e): Promise<void> {
            const result = confirm(`Are you sure you want to delete?`);

            if (result) {
                e.target.disabled = true;
                const bm = await this.executePost(`/beatmaps/${this.beatmap.id}/delete`, {}, e);

                if (!this.isError(bm)) {
                    ($('#editBeatmap')).modal('hide');
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
