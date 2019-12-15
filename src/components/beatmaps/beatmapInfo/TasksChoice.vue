<template>
    <div class="row">
        <div class="col-sm-12">
            <table class="table table-sm table-dark table-hover">
                <thead>
                    <td>Difficulty</td>
                    <td>Mapper(s)</td>
                    <td v-if="!isRanked && !isQualifed"></td>
                </thead>
                <transition-group tag="tbody" name="list">
                    <tr
                        v-for="task in beatmap.tasks"
                        :key="task.id"
                        :id="task.id + 'Row'"
                        :style="'border-left: 3px solid var(--'  + task.status.toLowerCase() + ')'"
                    >
                        <!-- Difficulty -->
                        <td class="text-white-50">
                            {{ task.name }} 
                            <template v-if="beatmap.mode == 'hybrid'">
                                <i
                                    v-if="task.mode == 'taiko'" 
                                    class="fas fa-drum"
                                ></i>
                                <i
                                    v-else-if="task.mode == 'catch'"
                                    class="fas fa-apple-alt"
                                ></i>
                                <i 
                                    v-else-if="task.mode == 'mania'" 
                                    class="fas fa-stream"
                                ></i>
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
                                        @click.prevent="taskToAddCollaborator = null"
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        :title="'cancel'"
                                    >
                                        <i class="fas fa-times"></i>
                                    </a>
                                    <a
                                        v-else
                                        href="#"
                                        class="text-success"
                                        @click.prevent="taskToAddCollaborator = task"
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        title="invite new collaborator"
                                    >
                                        <i class="fas fa-plus"></i>
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
                                            mapper.osuId != userOsuId
                                        "
                                        href="#"
                                        class="text-danger"
                                        @click.prevent="removeCollab(task.id, mapper.id, $event)"
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        title="remove collaborator"
                                    >
                                        <i class="fas fa-minus"></i>
                                    </a>
                                </a>
                            </div>
                        </td>

                        <!-- Actions -->
                        <td v-if="!isRanked && !isQualifed">
                            <a
                                href="#"
                                v-if="canEditTask(task)"
                                class="text-danger"
                                @click.prevent="removeTask(task.id, $event)"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="delete"
                            >
                                <i class="fas fa-minus"></i>
                            </a>
                            <span v-if="canEditTask(task)">
                                <a
                                    v-if="task.status == 'WIP'"
                                    href="#"
                                    class="text-success"
                                    @click.prevent="setTaskStatus(task.id, 'Done', $event)"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title="mark as done"
                                >
                                    <i class="fas fa-check"></i>
                                </a>
                                <a
                                    v-if="task.status == 'Done' && beatmap.status != 'Done'"
                                    href="#"
                                    class="icon-wip"
                                    @click.prevent="setTaskStatus(task.id, 'WIP', $event)"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title="mark as WIP"
                                >
                                    <i class="fas fa-ellipsis-h"></i>
                                </a>
                            </span>
                        </td>
                    </tr>
                </transition-group>
            </table>
        </div>

        <template v-if="!isRanked && !isQualifed">
            <div class="col-sm-12 mt-2">
                <new-task
                    :beatmap="beatmap"
                    :is-host="isHost"
                    :task-to-add-collaborator.sync="taskToAddCollaborator"
                    @update:beatmap="$emit('update:beatmap', $event)"
                    @update:invite-confirm="inviteConfirmMessage = $event"
                    @update:info="$emit('update:info', $event)"
                ></new-task>
            </div>

            <div
                v-if="inviteConfirmMessage"
                class="col-sm-12 mt-2 text-center"
            >
                <span class="mr-auto confirm">
                    {{ inviteConfirmMessage }}
                </span>
            </div>
        </template>
    </div>
</template>

<script>
import mixin from '../../../mixins.js';
import NewTask from './NewTask.vue';

export default {
    name: 'tasks-choice',
    components: {
        NewTask,
    },
    mixins: [ mixin ],
    props: {
        beatmap: Object,
        isHost: Boolean,
        isRanked: Boolean,
        isQualifed: Boolean,
        userOsuId: Number,
    },
    data () {
        return {
            inviteConfirmMessage: null,
            taskToAddCollaborator: null,
        }
    },
    mounted () {
        this.$parent.sortDiffs();
    },
    methods: {
        isOwner(mappers) {
            return mappers.some(m => m.osuId == this.userOsuId);
        },
        canEditTask(task) {
            return this.isOwner(task.mappers) || this.isHost;
        },
        async setTaskStatus(id, status, e) {
            e.target.classList.add('fake-button-disable');

            const bm = await this.executePost('/beatmaps/setTaskStatus/' + id, { status });
            
            if (!bm || bm.error) {
                this.$emit('update:info', (bm && bm.error) || 'Something went wrong!');
            } else {
                this.$emit('update:beatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },
        async removeTask(id, e) {
            e.target.classList.add('fake-button-disable');

            const bm = await this.executePost('/beatmaps/removeTask/' + id, {
                beatmapId: this.beatmap._id,
            });

            if (!bm || bm.error) {
                this.$emit('update:info', (bm && bm.error) || 'Something went wrong!');
            } else {
                this.$emit('update:beatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },

        // Collab stuff
        canEditTaskCollaborators(task) {
            return (task.status != 'Done' &&
                !this.isQualifed &&
                this.beatmap.status != 'Done' &&
                this.isOwner(task.mappers));
        },
        async removeCollab(id, user, e) {
            e.target.classList.add('fake-button-disable');

            const bm = await this.executePost('/beatmaps/task/' + id + '/removeCollab', { user: user });
            if (!bm || bm.error) {
                this.$emit('update:info', (bm && bm.error) || 'Something went wrong!');
            } else {
                this.$emit('update:beatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },
        isAddingCollaborator(task) {
            return this.taskToAddCollaborator && 
                this.taskToAddCollaborator.id == task.id;
        }
    }
}
</script>
