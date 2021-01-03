<template>
    <div class="card card-body container">
        <h5>
            Associated maps
        </h5>

        <ul v-if="associatedMaps.length" class="ps-3 mb-0 list-unstyled">
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
            </li>
        </ul>

        <div v-else class="small text-white-50 ms-3">
            No associated maps...
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import { Beatmap, BeatmapStatus } from '../../../../interfaces/beatmap/beatmap';

export default defineComponent({
    props: {
        associatedMaps: {
            type: Array as () => Beatmap[],
            required: true,
        },
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
    },
});
</script>
