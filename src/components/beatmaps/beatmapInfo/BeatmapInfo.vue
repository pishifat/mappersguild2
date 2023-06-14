<template>
    <div v-if="beatmap" class="container">
        <div class="row">
            <!-- LEFT SIDE -->
            <div :class="(isHost && !isRanked) ? 'col-lg-7' : 'col-sm-12'">
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

                <hr />

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
            <div v-if="isHost && !isRanked" class="col-lg-5 bm-col-separator-left">
                <div class="row mb-2">
                    <div class="col-sm">
                        <mode-choice
                            v-if="beatmap.status == 'WIP'"
                            :beatmap="beatmap"
                        />
                    </div>
                </div>

                <div v-if="!isQualified" class="row mb-2">
                    <div class="col-sm">
                        <status-choice
                            :beatmap="beatmap"
                        />
                    </div>
                </div>

                <quest-or-mission-choice
                    :beatmap="beatmap"
                />

                <beatmap-link
                    v-if="!isQualified"
                    :beatmap="beatmap"
                />

                <locks-choice
                    v-if="beatmap.status == 'WIP'"
                    :beatmap="beatmap"
                    :beatmap-id="beatmap.id"
                />
            </div>
        </div>

        <hr />

        <div class="row">
            <!-- points calculation -->
            <points
                class="col-sm-8"
                :beatmap="beatmap"
            />

            <div class="col-sm-4 text-end">
                <span class="small text-white-50">
                    Created: {{ beatmap.createdAt.toString().slice(0, 10) }}
                </span>
                <button
                    v-if="isHost && !isRanked"
                    id="deleteButton"
                    class="btn btn-sm btn-outline-danger ms-2"
                    @click="deleteMap($event)"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import ModeChoice from './ModeChoice.vue';
import StatusChoice from './StatusChoice.vue';
import TasksChoice from './TasksChoice.vue';
import QuestOrMissionChoice from './QuestOrMissionChoice.vue';
import ModdersList from './ModdersList.vue';
import NominatorsList from './NominatorsList.vue';
import BeatmapLink from './BeatmapLink.vue';
import LocksChoice from './LocksChoice.vue';
import Points from './Points.vue';
import { Beatmap, BeatmapStatus } from '../../../../interfaces/beatmap/beatmap';

export default defineComponent({
    name: 'BeatmapInfo',
    components: {
        ModeChoice,
        StatusChoice,
        TasksChoice,
        QuestOrMissionChoice,
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
            'loggedInUser',
        ]),
        isHost(): boolean {
            if (this.loggedInUser.id && this.beatmap) {
                return this.loggedInUser.id === this.beatmap.host.id;
            }

            return false;
        },
        isRanked(): boolean {
            return this.beatmap.status === BeatmapStatus.Ranked;
        },
        isQualified(): boolean {
            return this.beatmap.status === BeatmapStatus.Qualified;
        },
    },
    methods: {
        async deleteMap(e): Promise<void> {
            const result = confirm(`Are you sure you want to delete?`);

            if (result) {
                e.target.disabled = true;
                const bm = await this.$http.executePost(`/beatmaps/${this.beatmap.id}/delete`, {}, e);

                if (!this.$http.isError(bm)) {
                    this.$bs.hideModal('editBeatmap');
                    this.$store.commit('beatmaps/deleteBeatmap', bm);
                }

                e.target.disabled = false;
            }
        },
    },
});
</script>

<style scoped>
@media (min-width: 992px) {
    .bm-col-separator-left {
        border-left: 3px solid rgba(100, 88, 88, 0.42);
    }
}
</style>
