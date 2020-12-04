<template>
    <div>
        <p>
            ## {{ navigation + displayMode }}
        </p>
        <div v-for="beatmap in beatmaps" :key="beatmap.id">
            - [{{ beatmap.song.artist }} - {{ beatmap.song.title }}]({{ beatmap.url }})
            {{ beatmap.mappers.length > 1 ? 'hosted by' : 'by' }}
            [{{ beatmap.host.username }}]({{ 'https://osu.ppy.sh/users/' + beatmap.host.osuId }})
        </div>
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
