<template>
    <div>
        <p class="sub-header text-shadow min-spacing">
            <u>Associated maps</u>
        </p>

        <ul v-if="associatedMaps.length" class="min-spacing ml-3">
            <li v-for="map in associatedMaps" :key="map.id" class="small text-shadow text-white-50">
                <a v-if="map.url" :href="map.url" target="_blank">
                    {{ map.song.artist }} - {{ map.song.title }}
                </a>
                <span v-else>{{ map.song.artist }} - {{ map.song.title }}</span>
                by <a :href="'https://osu.ppy.sh/users/' + map.host.osuId" target="_blank">{{ map.host.username }}</a>
            </li>
        </ul>

        <p v-else class="small text-shadow min-spacing text-white-50 ml-3">
            No associated maps...
        </p>
    </div>
</template>


<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        associatedMaps: {
            type: Array,
            required: true,
        },
    },
});
</script>
