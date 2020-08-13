<template>
    <div>
        <div class="sub-header">
            <u>Associated maps</u>
        </div>

        <ul v-if="associatedMaps.length" class="ml-3 p-0">
            <li v-for="map in associatedMaps" :key="map.id" class="small text-white-50">
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
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';

export default Vue.extend({
    props: {
        associatedMaps: {
            type: Array as () => Beatmap[],
            required: true,
        },
    },
});
</script>

<style scoped>

ul {
    list-style-type: none;
}

</style>