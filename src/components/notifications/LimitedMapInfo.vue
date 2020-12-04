<template>
    <div id="limitedEditBeatmap" class="modal fade overlay-modal my-4" tabindex="-1">
        <div class="modal-dialog modal-md">
            <div v-if="beatmap" class="modal-content bg-dark">
                <div class="modal-header text-dark" :class="'bg-' + beatmap.status.toLowerCase()">
                    <h5 class="modal-title">
                        {{ beatmap.song.artist }} - {{ beatmap.song.title }} ({{ beatmap.host.username }})
                        <i v-if="beatmap.mode == 'taiko'" class="fas fa-drum" />
                        <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt" />
                        <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream" />
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden;">
                    <img src="/images/the_A.png" class="the-a-background">
                    <div class="container">
                        <div class="row">
                            <div class="col-sm-12">
                                <table class="table table-sm">
                                    <thead>
                                        <th scope="col">
                                            Difficulty
                                        </th>
                                        <th scope="col">
                                            Mapper(s)
                                        </th>
                                        <th v-if="beatmap.status != 'Ranked'" scope="col">
                                            Status
                                        </th>
                                    </thead>
                                    <transition-group id="difficulties" tag="tbody" name="list">
                                        <tr v-for="task in beatmap.tasks" :id="task.id + 'Row'" :key="task.id">
                                            <td scope="row">
                                                {{ task.name }}
                                            </td>
                                            <td scope="row">
                                                <template v-for="(mapper, i) in task.mappers">
                                                    <a :key="mapper.id" :href="'https://osu.ppy.sh/users/' + mapper.osuId" target="_blank">
                                                        {{ listUser(mapper.username, i, task.mappers.length) }}
                                                    </a>
                                                </template>
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
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';
import { Task, TaskName } from '../../../interfaces/beatmap/task';

export default Vue.extend({
    name: 'LimitedMapInfo',
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
