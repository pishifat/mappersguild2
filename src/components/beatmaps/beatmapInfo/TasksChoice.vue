<template>
    <div class="row">
        <div class="col-sm-12">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Difficulty</th>
                        <th>Mapper(s)</th>
                        <th v-if="!isRanked && !isQualified" />
                    </tr>
                </thead>
                <transition-group tag="tbody" name="list">
                    <tr
                        v-for="task in sortedTasks"
                        :id="task.id + 'Row'"
                        :key="task.id"
                    >
                        <!-- Difficulty -->
                        <td
                            class="text-white-50"
                            :class="`card-status-${task.status.toLowerCase()}`"
                        >
                            {{ task.name }}
                            <template v-if="beatmap.mode == 'hybrid'">
                                <modes-icons :modes="[task.mode]" />
                            </template>
                        </td>

                        <!-- Mappers -->
                        <td>
                            <div
                                v-for="(mapper, i) in task.mappers"
                                :key="mapper.id"
                            >
                                <template v-if="i == 0 && canEditTaskCollaborators(task)">
                                    <a
                                        v-if="isAddingCollaborator(task)"
                                        v-bs-tooltip="'cancel'"
                                        href="#"
                                        class="text-danger"
                                        @click.prevent="taskToAddCollaborator = undefined"
                                    >
                                        <i class="fas fa-times" />
                                    </a>
                                    <a
                                        v-else
                                        v-bs-tooltip="'add new collaborator'"
                                        href="#"
                                        class="text-success"
                                        @click.prevent="taskToAddCollaborator = task"
                                    >
                                        <i class="fas fa-plus" />
                                    </a>
                                </template>

                                <user-link class="mx-1" :user="mapper" />
                                <a
                                    v-if="
                                        task.mappers.length > 1 &&
                                            canEditTaskCollaborators(task) &&
                                            mapper.osuId != loggedInUser.osuId
                                    "
                                    v-bs-tooltip="'remove collaborator'"
                                    href="#"
                                    class="text-danger"
                                    @click.prevent="removeCollab(task.id, mapper.id, $event)"
                                >
                                    <i class="fas fa-minus" />
                                </a>
                            </div>
                        </td>

                        <!-- Actions -->
                        <td v-if="!isRanked && !isQualified">
                            <template v-if="canEditTask(task)">
                                <a
                                    v-bs-tooltip="'delete'"
                                    href="#"
                                    class="text-danger me-1"
                                    @click.prevent="removeTask(task.id, $event)"
                                >
                                    <i class="fas fa-minus" />
                                </a>
                                <a
                                    v-if="task.status == 'WIP'"
                                    v-bs-tooltip="'mark as done'"
                                    href="#"
                                    class="text-success me-1"
                                    @click.prevent="setTaskStatus(task.id, 'Done', $event)"
                                >
                                    <i class="fas fa-check" />
                                </a>
                                <a
                                    v-if="task.status == 'Done' && beatmap.status != 'Done'"
                                    v-bs-tooltip="'mark as WIP'"
                                    href="#"
                                    class="text-wip me-1"
                                    @click.prevent="setTaskStatus(task.id, 'WIP', $event)"
                                >
                                    <i class="fas fa-ellipsis-h" />
                                </a>
                            </template>
                        </td>
                    </tr>
                </transition-group>
            </table>
        </div>

        <template v-if="!isRanked && !isQualified">
            <div class="col-sm-12 mt-2">
                <new-task
                    v-model:task-to-add-collaborator="taskToAddCollaborator"
                    :beatmap="beatmap"
                    :is-host="isHost"
                />
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import NewTask from './NewTask.vue';
import { User } from '../../../../interfaces/user';
import { Task } from '../../../../interfaces/beatmap/task';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';
import ModesIcons from '@components/ModesIcons.vue';

export default defineComponent({
    name: 'TasksChoice',
    components: {
        NewTask,
        ModesIcons,
    },
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
        isHost: Boolean,
        isRanked: Boolean,
        isQualified: Boolean,
    },
    data () {
        return {
            taskToAddCollaborator: undefined as undefined | Task,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        sortedTasks(): Task[] {
            const difficultyOrder = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'];
            const modeOrder = ['osu', 'taiko', 'catch', 'mania', 'sb'];

            const newTasks = [...this.beatmap.tasks].sort(function(a, b) {
                return difficultyOrder.indexOf(a.name) - difficultyOrder.indexOf(b.name);
            });

            return newTasks.sort(function(a, b) {
                return modeOrder.indexOf(a.mode) - modeOrder.indexOf(b.mode);
            });
        },
    },
    methods: {
        isOwner(mappers: User[]): boolean {
            return mappers.some(m => m.osuId == this.loggedInUser.osuId);
        },
        canEditTask(task: Task): boolean {
            return this.isOwner(task.mappers) || this.isHost;
        },
        async setTaskStatus(id, status, e): Promise<void> {
            e.target.classList.add('fake-button-disable');

            const bm = await this.$http.executePost('/beatmaps/setTaskStatus/' + id, { status });

            if (!this.$http.isError(bm)) {
                this.$store.dispatch('beatmaps/updateBeatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },
        async removeTask(id, e): Promise<void> {
            e.target.classList.add('fake-button-disable');

            const bm = await this.$http.executePost('/beatmaps/removeTask/' + id, {
                beatmapId: this.beatmap.id,
            });

            if (!this.$http.isError(bm)) {
                this.$store.dispatch('beatmaps/updateBeatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },

        // Collab stuff
        canEditTaskCollaborators(task: Task): boolean {
            return (task.status != 'Done' &&
                !this.isQualified &&
                this.beatmap.status != 'Done' &&
                this.canEditTask(task));
        },
        async removeCollab(id, user, e): Promise<void> {
            e.target.classList.add('fake-button-disable');

            const bm = await this.$http.executePost('/beatmaps/task/' + id + '/removeCollab', { user });

            if (!this.$http.isError(bm)) {
                this.$store.dispatch('beatmaps/updateBeatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },
        isAddingCollaborator(task: Task): boolean {
            return this.taskToAddCollaborator?.id == task.id;
        },
    },
});
</script>

<style scoped>
.fake-button-disable {
    pointer-events: none;
    opacity: 0.6;
}
</style>