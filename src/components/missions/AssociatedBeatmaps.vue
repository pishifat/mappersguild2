<template>
    <div>
        <b>Associated maps:</b>

        <ul v-if="mission.associatedMaps && mission.associatedMaps.length" class="ps-3 mb-0 list-unstyled">
            <li
                v-for="map in mission.associatedMaps"
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
                <!-- delete map from list -->
                <span v-if="(loggedInUser.id == map.host.id && mission.status == 'open') || isAdminPage" class="small">
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
                        :class="processing ? 'opacity-50 pe-none' : 'text-danger'"
                        href="#"
                        @click.prevent="removeBeatmapFromMission(map.id, $event)"
                    >
                        confirm
                    </a>
                </span>
                <!-- mark map as winner -->
                <span v-if="loggedInUser.group == 'admin' && isAdminPage" class="small ms-1">
                    <a
                        v-if="confirmWin != map.id"
                        href="#"
                        class="text-success"
                        @click.prevent="confirmWin = map.id"
                    >
                        {{ isWinningBeatmap(map.id) ? 'un-set as winner' : 'set as winner' }}
                    </a>
                    <a
                        v-else
                        :class="processing ? 'opacity-50 pe-none' : 'text-success'"
                        href="#"
                        @click.prevent="toggleWinningBeatmap(map.id, $event)"
                    >
                        confirm
                    </a>
                </span>
                <!-- mark map as invalid -->
                <span v-if="loggedInUser.group == 'admin' && isAdminPage" class="small ms-1">
                    <a
                        v-if="confirmInvalid != map.id"
                        href="#"
                        class="text-warning"
                        @click.prevent="confirmInvalid = map.id"
                    >
                        {{ isInvalidBeatmap(map.id) ? 'un-set as invalid' : 'set as invalid' }}
                    </a>
                    <a
                        v-else
                        :class="processing ? 'opacity-50 pe-none' : 'text-warning'"
                        href="#"
                        @click.prevent="toggleInvalidBeatmap(map.id, $event)"
                    >
                        confirm
                    </a>
                </span>
                <!-- publicly display as winner -->
                <span v-if="!isAdminPage && isWinningBeatmap(map.id)" class="text-success">
                    (winner)
                </span>
                <span v-if="!isAdminPage && isInvalidBeatmap(map.id)" class="text-danger small">
                    (invalid)
                </span>
            </li>
            <div v-if="mission.status == 'open'" class="small text-secondary ms-3 mt-2">
                If you create a map for this quest, add it above!
            </div>
        </ul>

        <div v-else class="small text-secondary ms-3">
            No associated maps. If you create a map for this quest, add it above!
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { BeatmapStatus } from '@interfaces/beatmap/beatmap';
import { Mission } from '@interfaces/mission';

export default defineComponent({
    props: {
        mission: {
            type: Object as () => Mission,
            required: true,
        },
        isAdminPage: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            confirmDelete: '',
            confirmWin: '',
            confirmInvalid: '',
            processing: false,
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
        isWinningBeatmap(beatmapId): boolean {
            const winningBeatmapIds = this.mission.winningBeatmaps.map(b => b.id);

            return winningBeatmapIds.includes(beatmapId);
        },
        isInvalidBeatmap(beatmapId): boolean {
            const invalidBeatmapIds = this.mission.invalidBeatmaps.map(b => b.id);

            return invalidBeatmapIds.includes(beatmapId);
        },
        async removeBeatmapFromMission(beatmapId, e): Promise<void> {
            this.processing = true;
            const mission = await this.$http.executePost<Mission>(`/missions/${this.mission.id}/${beatmapId}/removeBeatmapFromMission`, {}, e);

            if (!this.$http.isError(mission)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Removed beatmap from mission`,
                    type: 'info',
                });

                if (this.isAdminPage) {
                    this.$store.commit('updateAssociatedMaps', {
                        missionId: this.mission.id,
                        associatedMaps: mission.associatedMaps,
                    });
                } else {
                    this.$store.commit('missions/updateMission', mission);
                }
            }

            this.processing = false;
            this.confirmDelete = '';
        },
        async toggleWinningBeatmap(beatmapId, e): Promise<void> {
            this.processing = true;
            const winningBeatmaps = await this.$http.executePost<Mission>(`/admin/missions/${this.mission.id}/${beatmapId}/toggleWinningBeatmap`, {}, e);

            if (!this.$http.isError(winningBeatmaps)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled winning beatmap for mission`,
                    type: 'info',
                });
                this.$store.commit('updateWinningBeatmaps', {
                    missionId: this.mission.id,
                    winningBeatmaps,
                });
            }

            this.processing = false;
            this.confirmWin = '';
        },
        async toggleInvalidBeatmap(beatmapId, e): Promise<void> {
            this.processing = true;
            const invalidBeatmaps = await this.$http.executePost<Mission>(`/admin/missions/${this.mission.id}/${beatmapId}/toggleInvalidBeatmap`, {}, e);

            if (!this.$http.isError(invalidBeatmaps)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled invalid beatmap for mission`,
                    type: 'info',
                });
                this.$store.commit('updateInvalidBeatmaps', {
                    missionId: this.mission.id,
                    invalidBeatmaps,
                });
            }

            this.processing = false;
            this.confirmWin = '';
        },
    },
});
</script>
