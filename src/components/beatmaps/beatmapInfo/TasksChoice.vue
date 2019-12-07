<template>
    <div class="row">
        <div class="col-sm-12">
            <table class="w-100 table table-sm table-dark table-hover">
                <thead>
                    <td>Difficulty</td>
                    <td>Mapper(s)</td>
                    <td v-if="!isRanked"></td>
                </thead>
                <transition-group tag="tbody" name="list" id="difficulties">
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
                                <a 
                                    :href="'https://osu.ppy.sh/users/' + mapper.osuId"
                                    target="_blank"
                                >
                                    {{ mapper.username }} 
                                    <a
                                        v-if="
                                            task.mappers.length > 1 &&
                                            canEditTaskCollaborators(task)
                                        "
                                        href="#"
                                        class="text-danger"
                                        @click.prevent="removeCollab(task, mapper.id)"
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        title="remove collaborator"
                                    >
                                        <i class="fas fa-minus"></i>
                                    </a>
                                </a>
                            </div>
                            <a
                                href="#"
                                v-if="canEditTaskCollaborators(task)"
                                :class="{
                                    'fake-collab-button-disable': addCollabInput == task.id,
                                }"
                                class="text-success"
                                @click.prevent="
                                    addCollabInput == task.id ? 
                                    cancelCollabInput() : displayCollabInput(task)
                                "
                                data-toggle="tooltip"
                                data-placement="top"
                                title="invite new collaborator"
                            >
                                <i class="fas fa-plus"></i>
                            </a>
                        </td>

                        <!-- Actions -->
                        <td v-if="!isRanked">
                            <a
                                href="#"
                                v-if="canEditTask(task)"
                                class="text-danger"
                                :class="
                                    beatmap.status == 'Qualified' ||
                                    fakeButton == task.id ? 
                                    'fake-button-disable' : ''
                                "
                                @click.prevent="removeTask(task.id)"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="delete"
                            >
                                <i class="fas fa-minus"></i>
                            </a>
                            <span v-if="canEditTask(task)">
                                <a
                                    href="#"
                                    v-if="task.status == 'WIP'"
                                    :class="fakeButton == task.id ? 'fake-button-disable' : ''"
                                    class="text-success"
                                    @click.prevent="setTaskStatus(task.id, 'Done')"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title="mark as done"
                                >
                                    <i class="fas fa-check"></i>
                                </a>
                                <a
                                    href="#"
                                    v-if="task.status == 'Done'"
                                    :class="
                                        beatmap.status == 'Done' ||
                                        beatmap.status == 'Qualified' ||
                                        fakeButton == task.id ? 
                                        'fake-button-disable' : ''
                                    "
                                    class="icon-wip"
                                    @click.prevent="setTaskStatus(task.id, 'WIP')"
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

        <div class="col-sm-12 mt-2">
            <new-collab
                :beatmap="beatmap"
                :is-host="isHost"
                @update:invite-confirm="inviteConfirm = $event"
                @update:info="info = $event"
            ></new-collab>
        </div>
    </div>
</template>

<script>
import mixin from '../../../mixins.js';
import NewCollab from './NewCollab.vue';

export default {
    name: 'tasks-choice',
    components: {
        NewCollab,
    },
    mixins: [ mixin ],
    props: {
        beatmap: Object,
        isHost: Boolean,
        isRanked: Boolean,
    },
    data () {
        return {
            fakeButton: null,
            addCollabInput: null,
            removeCollabInput: null,
        }
    },
    methods: {
        async setTaskStatus(id, status) {
            this.fakeButton = id;
            this.addCollabInput = null;
            this.removeCollabInput = null;
            const bm = await this.executePost('/beatmaps/setTaskStatus/' + id, { status: status });
            if (bm) {
                this.$emit('update:beatmap', bm);
            }
            this.fakeButton = null;
        },
        async removeTask(id) {
            this.fakeButton = id;
            this.addCollabInput = null;
            this.removeCollabInput = null;
            const bm = await this.executePost('/beatmaps/removeTask/' + id, {
                beatmapId: this.beatmap._id,
            });
            if (bm) {
                this.$emit('update:beatmap', bm);
            }
            this.fakeButton = null;
        },
        displayCollabInput(task) {
            this.addCollabInput = task._id;
            this.removeCollabInput = null;
            this.requestDiffInput = null;
            this.collabTask = task;
        },
        undisplayCollabInput(task) {
            this.removeCollabInput = task._id;
            this.addCollabInput = null;
            this.requestDiffInput = null;
            this.collabTask = task;
        },
        cancelCollabInput() {
            this.removeCollabInput = null;
            this.addCollabInput = null;
        },
        isOwner(mappers) {
            let value;

            mappers.forEach(mapper => {
                if (mapper.osuId == this.userOsuId) {
                    value = true;
                    return;
                }
            });
            
            return value;
        },
        canEditTaskCollaborators(task) {
            task.status == 'Done' ||
            this.beatmap.status == 'Done' ||
            this.beatmap.status == 'Qualified'
        },
        canEditTask(task) {
            return isOwner(task.mappers) || this.isHost;
        }
    }
}
</script>
