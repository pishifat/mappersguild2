<template>
    <div
        v-if="beatmap.status == 'WIP' && remainingTasks.length"
        class="row mt-2 mb-3"
    >
        <div class="col-sm-12">
            <div class="input-group input-group-sm mx-auto">
                <select
                    v-if="!taskToAddCollaborator"
                    v-model="selectedTask"
                    class="form-select"
                >
                    <option
                        v-for="task in remainingTasks"
                        :key="task"
                        :value="task"
                    >
                        {{ task }}
                    </option>
                </select>

                <select
                    v-if="beatmap.mode == 'hybrid' && !taskToAddCollaborator"
                    v-model="selectedMode"
                    class="form-select"
                >
                    <option value="osu">
                        osu!
                    </option>
                    <option value="taiko">
                        osu!taiko
                    </option>
                    <option value="catch">
                        osu!catch
                    </option>
                    <option value="mania">
                        osu!mania
                    </option>
                </select>

                <input
                    v-if="isHost || taskToAddCollaborator"
                    v-model="addTaskUsername"
                    class="form-control"
                    type="text"
                    placeholder="add user to task..."
                    maxlength="18"
                    @keyup.enter="taskToAddCollaborator ? addCollab($event) : addTask($event)"
                />

                <button
                    v-bs-tooltip="'add difficulty'"
                    class="btn btn-outline-info"
                    @click="taskToAddCollaborator ? addCollab($event) : addTask($event)"
                >
                    <i class="fas fa-plus" />
                </button>
            </div>
        </div>

        <div
            v-if="taskToAddCollaborator"
            class="col-sm-12 mt-1 text-center"
        >
            <small>
                Adding collaborator for the selected difficulty
                <a class="text-danger" href="#" @click.prevent="$emit('update:taskToAddCollaborator', null)">
                    <i class="fas fa-times-circle" />
                </a>
            </small>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Beatmap, BeatmapMode } from '../../../../interfaces/beatmap/beatmap';
import { Task, TaskName } from '../../../../interfaces/beatmap/task';

export default defineComponent({
    name: 'NewTask',
    props: {
        isHost: Boolean,
        taskToAddCollaborator: {
            type: Object as () => Task,
            default: null,
        },
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    emits: [
        'update:taskToAddCollaborator',
    ],
    data () {
        return {
            selectedTask: TaskName.Easy,
            selectedMode: BeatmapMode.Osu,
            addTaskUsername: '',
        };
    },
    computed: {
        remainingTasks(): string[] {
            let possibleTasks = Object.values(TaskName);

            if (this.beatmap.tasksLocked && this.beatmap.tasksLocked.length && !this.isHost) {
                possibleTasks = possibleTasks.filter(t => !this.beatmap.tasksLocked.includes(t));
            }

            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.selectedTask = possibleTasks[0] || '';

            return possibleTasks;
        },
    },
    methods: {
        async addTask(e): Promise<void> {
            let mode: BeatmapMode;

            if (this.beatmap.mode == BeatmapMode.Hybrid) {
                mode = this.selectedMode;
            } else {
                mode = this.beatmap.mode;
            }

            const bm = await this.$http.executePost<Beatmap>('/beatmaps/addTask/' + this.beatmap.id, {
                user: this.addTaskUsername,
                taskName: this.selectedTask,
                username: this.addTaskUsername,
                mode,
            }, e);

            if (!this.$http.isError(bm)) {
                this.$store.dispatch('beatmaps/updateBeatmap', bm);
            }
        },
        async addCollab(e): Promise<void> {
            let mode;

            if (this.beatmap.mode == BeatmapMode.Hybrid) {
                mode = this.taskToAddCollaborator.mode;
            } else {
                mode = this.beatmap.mode;
            }

            // this doesn't exist anymore
            const bm = await this.$http.executePost<Beatmap>('/beatmaps/addCollab/' + this.beatmap.id, {
                user: this.addTaskUsername,
                task: this.taskToAddCollaborator,
                mode,
            }, e);

            if (!this.$http.isError(bm)) {
                this.$store.dispatch('beatmaps/updateBeatmap', bm);
                this.$store.dispatch('updateToastMessages', {
                    message: 'Added',
                    type: 'success',
                });
            }
        },
    },
});
</script>
