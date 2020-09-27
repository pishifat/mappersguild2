<template>
    <div>
        <div class="sub-header">
            <u>Associated maps</u>
        </div>

        <ul v-if="associatedMaps.length" class="ml-3 p-0">
            <li
                v-for="map in associatedMaps"
                :key="map.id"
                class="small text-white-50"
            >
                <i
                    class="fas"
                    :class="[map.status.toLowerCase(), findIcon(map.status)]"
                    data-toggle="tooltip"
                    :title="map.status"
                />
                <a v-if="map.url" :href="map.url" target="_blank">
                    {{ map.song.artist }} - {{ map.song.title }}
                </a>
                <span v-else>{{ map.song.artist }} - {{ map.song.title }}</span>
                by <a :href="'https://osu.ppy.sh/users/' + map.host.osuId" target="_blank">{{ map.host.username }}</a>
            </li>
        </ul>

        <div v-else class="small text-white-50 ml-3">
            No associated maps...
        </div>
    </div>
</template>


<script lang="ts">
import Vue from 'vue';
import { Beatmap, BeatmapStatus } from '../../../../interfaces/beatmap/beatmap';

export default Vue.extend({
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

<style scoped>

ul {
    list-style-type: none;
}

.card-status-wip {
    border-left: 4px solid var(--wip);
}

.card-status-done {
    border-left: 4px solid var(--done);
}

.card-status-qualified {
    border-left: 4px solid var(--guild);
}

.card-status-ranked {
    border-left: 4px solid var(--ranked);
}

</style>