<template>
    <div>
        <p>
            ## {{ navigation + displayMode }}
        </p>
        <div v-for="beatmap in beatmaps" :key="beatmap.id">
            - [{{ beatmap.song.artist }} - {{ beatmap.song.title }}]({{ beatmap.url }})
            {{ hasUniqueMapper(beatmap.tasks) ? 'by' : 'hosted by' }}
            [{{ beatmap.host.username }}]({{ 'https://osu.ppy.sh/users/' + beatmap.host.osuId }})
        </div>
        <br>
    </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { Beatmap } from '@interfaces/beatmap/beatmap';
import { Task } from '@interfaces/beatmap/task';

export default defineComponent({
    name: 'BeatmapList',
    props: {
        beatmaps: {
            type: Array as PropType<Beatmap[]>,
            default: () => [],
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
    methods: {
        hasUniqueMapper (tasks: Task[]) {
            let uniqueMapper = '';

            for (const task of tasks) {
                for (const mapper of task.mappers) {
                    if (!uniqueMapper) uniqueMapper = mapper.id;
                    else if (uniqueMapper !== mapper.id) return false;
                }
            }

            return true;
        },
    },
});
</script>
