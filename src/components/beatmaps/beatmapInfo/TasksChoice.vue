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
                        v-for="task in beatmap.tasks"
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
                                <i
                                    v-if="task.mode == 'taiko'"
                                    class="fas fa-drum"
                                />
                                <i
                                    v-else-if="task.mode == 'catch'"
                                    class="fas fa-apple-alt"
                                />
                                <i
                                    v-else-if="task.mode == 'mania'"
                                    class="fas fa-stream"
                                />
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
                                        href="#"
                                        class="text-danger"
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        :title="'cancel'"
                                        @click.prevent="taskToAddCollaborator = null"
                                    >
                                        <i class="fas fa-times" />
                                    </a>
                                    <a
                                        v-else
                                        href="#"
                                        class="text-success"
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        title="invite new collaborator"
                                        @click.prevent="taskToAddCollaborator = task"
                                    >
                                        <i class="fas fa-plus" />
                                    </a>
                                </template>

                                <a
                                    :href="'https://osu.ppy.sh/users/' + mapper.osuId"
                                    target="_blank"
                                >
                                    {{ mapper.username }}
                                    <a
                                        v-if="
                                            task.mappers.length > 1 &&
                                                canEditTaskCollaborators(task) &&
                                                mapper.osuId != loggedInUser.osuId
                                        "
                                        href="#"
                                        class="text-danger"
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        title="remove collaborator"
                                        @click.prevent="removeCollab(task.id, mapper.id, $event)"
                                    >
                                        <i class="fas fa-minus" />
                                    </a>
                                </a>
                            </div>
                        </td>

                        <!-- Actions -->
                        <td v-if="!isRanked && !isQualified">
                            <a
                                v-if="canEditTask(task)"
                                href="#"
                                class="text-danger"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="delete"
                                @click.prevent="removeTask(task.id, $event)"
                            >
                                <i class="fas fa-minus" />
                            </a>
                            <span v-if="canEditTask(task)">
                                <a
                                    v-if="task.status == 'WIP'"
                                    href="#"
                                    class="text-success"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="mark as done"
                                    @click.prevent="setTaskStatus(task.id, 'Done', $event)"
                                >
                                    <i class="fas fa-check" />
                                </a>
                                <a
                                    v-if="task.status == 'Done' && beatmap.status != 'Done'"
                                    href="#"
                                    class="text-wip"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="mark as WIP"
                                    @click.prevent="setTaskStatus(task.id, 'WIP', $event)"
                                >
                                    <i class="fas fa-ellipsis-h" />
                                </a>
                            </span>
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

export default defineComponent({
    name: 'TasksChoice',
    components: {
        NewTask,
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
            taskToAddCollaborator: null as null | Task,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
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
                this.isOwner(task.mappers));
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
