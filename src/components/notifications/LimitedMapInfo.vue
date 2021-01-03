<template>
    <modal-dialog
        id="limitedEditBeatmap"
        modal-size="md"
        :header-class="beatmap ? ('bg-' + beatmap.status.toLowerCase()) : ''"
        :loaded="Boolean(beatmap)"
    >
        <template #header>
            {{ beatmap.song.artist }} - {{ beatmap.song.title }} ({{ beatmap.host.username }})
            <i v-if="beatmap.mode == 'taiko'" class="fas fa-drum" />
            <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt" />
            <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream" />
        </template>

        <template #default>
            <div class="container">
                <div class="row">
                    <div class="col-sm-12">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th scope="col">
                                        Difficulty
                                    </th>
                                    <th scope="col">
                                        Mapper(s)
                                    </th>
                                    <th v-if="beatmap.status != 'Ranked'" scope="col">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <transition-group id="difficulties" tag="tbody" name="list">
                                <tr v-for="task in beatmap.tasks" :id="task.id + 'Row'" :key="task.id">
                                    <td scope="row">
                                        {{ task.name }}
                                    </td>
                                    <td scope="row">
                                        <a
                                            v-for="(mapper, i) in task.mappers"
                                            :key="mapper.id"
                                            :href="'https://osu.ppy.sh/users/' + mapper.osuId"
                                            target="_blank"
                                        >
                                            {{ listUser(mapper.username, i, task.mappers.length) }}
                                        </a>
                                    </td>
                                    <td v-if="beatmap.status != 'Ranked'" scope="row" :class="task.status.toLowerCase()">
                                        {{ task.status }}
                                    </td>
                                </tr>
                            </transition-group>
                        </table>
                    </div>
                </div>
            </div>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalDialog from '@components/ModalDialog.vue';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';
import { Task, TaskName } from '../../../interfaces/beatmap/task';

export default defineComponent({
    name: 'LimitedMapInfo',
    components: {
        ModalDialog,
    },
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    computed: {
        sortTasks (): Task[] {
            const sortOrder = Object.values(TaskName);
            const beatmap = { ...this.beatmap };

            return beatmap.tasks.sort(function(a, b) {
                return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
            });
        },
    },
});
</script>
