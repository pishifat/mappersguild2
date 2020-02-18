<template>
    <div>
        <samp class="small text-white-50">
            ## {{ navigation + displayMode }}
        </samp><br>
        <span v-for="beatmap in beatmaps" :key="beatmap.id">
            <samp class="small text-white-50">
                - [{{ beatmap.song.artist }} - {{ beatmap.song.title }}]({{ beatmap.url }})
                {{ beatmap.mappers.length > 1 ? 'hosted by' : 'by' }}
                [{{ beatmap.host.username }}]({{ 'https://osu.ppy.sh/users/' + beatmap.host.osuId }})
            </samp><br>
        </span>
        <br>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'BeatmapList',
    props: {
        beatmaps: {
            type: Array,
            default: null,
        },
        displayMode: {
            type: String,
            default: null,
        },
        rawMode: {
            type: String,
            default: null,
        },
    },
    computed: {
        navigation(): string {
            return '<a id="' + this.rawMode + '"></a>';
        },
    },
});
</script>

<style>
</style>