<template>
    <div>
        <b>Associated maps:</b>

        <ul v-if="associatedMaps && associatedMaps.length" class="ps-3 mb-0 list-unstyled">
            <li
                v-for="map in associatedMaps"
                :key="map.id"
                class="text-secondary"
            >
                <i
                    v-bs-tooltip="map.status"
                    class="fas me-1"
                    :class="[`text-${map.status.toLowerCase()}`, findIcon(map.status)]"
                />
                <a v-if="map.url" :href="map.url" target="_blank">
                    {{ map.song.artist }} - {{ map.song.title }}
                </a>
                <span v-else>{{ map.song.artist }} - {{ map.song.title }}</span>
                by
                <user-link :user="map.host" />
                <span v-if="loggedInUser.id == map.host.id && missionStatus == 'open'" class="small">
                    <a
                        v-if="confirmDelete != map.id"
                        href="#"
                        class="text-danger"
                        @click.prevent="confirmDelete = map.id"
                    >
                        delete
                    </a>
                    <a
                        v-else
                        :class="processingDelete ? 'opacity-50' : 'text-danger'"
                        :style="processingDelete ? 'pointer-events: none;' : ''"
                        href="#"
                        @click.prevent="removeBeatmapFromMission(map.id, $event)"
                    >
                        confirm
                    </a>
                </span>
            </li>
            <div class="small text-white-50 ms-3 mt-2">
                If you create a map for this, add it above!
            </div>
        </ul>

        <div v-else class="small text-white-50 ms-3">
            No associated maps. If you create a map for this, add it above!
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Beatmap, BeatmapStatus } from '@interfaces/beatmap/beatmap';
import { Mission } from '@interfaces/mission';

export default defineComponent({
    props: {
        associatedMaps: {
            type: Array as () => Beatmap[],
            required: true,
        },
        missionId: {
            type: String,
            required: true,
        },
        missionStatus: {
            type: String,
            required: true,
        },
    },
    data () {
        return {
            confirmDelete: '',
            processingDelete: false,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
    },
    methods: {
        findIcon(status): string {
            if (status == BeatmapStatus.WIP) {
                return 'fa-ellipsis-h';
            } else if (status == BeatmapStatus.Done) {
                return 'fa-check';
            } else if (status == BeatmapStatus.Qualified) {
                return 'fa-check-circle';
            } else if (status == BeatmapStatus.Ranked) {
                return 'fa-check-circle';
            }

            return '';
        },
        async removeBeatmapFromMission(beatmapId, e): Promise<void> {
            this.processingDelete = true;
            const mission = await this.$http.executePost<Mission>(`/missions/${this.missionId}/${beatmapId}/removeBeatmapFromMission`, {}, e);

            if (!this.$http.isError(mission)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Removed beatmap from mission`,
                    type: 'info',
                });
                this.$store.commit('missions/updateMission', mission);
            }

            this.processingDelete = false;
        },
    },
});
</script>
