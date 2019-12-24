<template>
    <div
        v-if="beatmap.status == 'WIP' && remainingTasks.length"
        class="row mt-2 mb-3"
    >
        <div class="col-sm-12 form-inline">
            <div class="input-group input-group-sm mx-auto">
                <select
                    v-if="!taskToAddCollaborator"
                    v-model="selectedTask"
                    class="form-control"
                >
                    <option
                        v-for="task in remainingTasks"
                        :value="task"
                    >
                        {{ task }}
                    </option>
                </select>
                
                <select
                    v-if="beatmap.mode == 'hybrid' && !taskToAddCollaborator"
                    v-model="selectedMode"
                    class="form-control"
                >
                    <option value="osu">osu!</option>
                    <option value="taiko">osu!taiko</option>
                    <option value="catch">osu!catch</option>
                    <option value="mania">osu!mania</option>
                </select>

                <input
                    v-if="isHost || taskToAddCollaborator"
                    class="form-control w-25"
                    type="text"
                    placeholder="request to... (if needed)"
                    maxlength="18"
                    v-model="requestTaskUsername"
                    @keyup.enter="taskToAddCollaborator ? addCollab($event) : requestTask(beatmap.id, $event)"
                />

                <button
                    class="btn btn-sm btn-outline-info ml-1"
                    @click="taskToAddCollaborator ? addCollab($event) : addTask(beatmap.id, $event)"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="add difficulty"
                >
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>

        <div
            v-if="taskToAddCollaborator"
            class="col-sm-12 mt-1 text-center"
        >
            <small>
                Adding collaborator for the selected difficulty 
                <a class="text-danger" href="#" @click="$emit('update:task-to-add-collaborator', null)">
                    <i class="fas fa-times-circle"></i>
                </a>
            </small>
        </div>
    </div>
</template>

<script>
import mixin from '../../../mixins.js';

export default {
    name: 'new-task',
    mixins: [ mixin ],
    props: {
        beatmap: Object,
        isHost: Boolean,
        taskToAddCollaborator: Object,
    },
    data () {
        return {
            selectedTask: 'Easy',
            selectedMode: 'osu',
            requestTaskUsername: null,
        }
    },
    computed: {
        remainingTasks() {
            let possibleTasks = [
                'Easy',
                'Normal',
                'Hard',
                'Insane',
                'Expert',
                'Storyboard',
            ];

            if (this.beatmap.tasksLocked && this.beatmap.tasksLocked.length && !this.isHost) {
                possibleTasks = possibleTasks.filter(t => !this.beatmap.tasksLocked.includes(t));
            }
            
            this.selectedTask = possibleTasks[0] || null;
            return possibleTasks;
        },
    },
    methods: {
        addTask: async function(id, e) {
            if (this.requestTaskUsername && this.requestTaskUsername.length) {
                this.requestTask(id, e);
                return;
            }

            let mode;
            if (this.beatmap.mode == 'hybrid') {
                mode = this.selectedMode;
            }else{
                mode = this.beatmap.mode;
            }

            const bm = await this.executePost('/beatmaps/addTask/' + id, { 
                taskName: this.selectedTask, 
                mode
            }, e);

            if (!bm || bm.error) {
                this.$emit('update:info', bm.error);
                this.$emit('update:invite-confirm', null);
            } else {
                this.$emit('update:beatmap', bm);
            }
        },
        requestTask: async function(id, e) {
            let mode;
            if (this.beatmap.mode == 'hybrid') {
                mode = this.selectedMode;
            }else{
                mode = this.beatmap.mode;
            }

            const bm = await this.executePost('/beatmaps/requestTask/' + id, { 
                taskName: this.selectedTask, 
                user: this.requestTaskUsername, 
                mode 
            }, e);

            if (!bm || bm.error) {
                this.$emit('update:info', bm.error);
                this.$emit('update:invite-confirm', null);
            } else {
                this.$emit('update:beatmap', bm);
                this.$emit('update:invite-confirm', 'Difficulty request sent!');
            }
        },
        addCollab: async function(e) {
            let mode;
            if (this.beatmap.mode == 'hybrid') {
                mode = this.taskToAddCollaborator.mode;
            }else{
                mode = this.beatmap.mode;
            }

            const bm = await this.executePost('/beatmaps/task/' + this.taskToAddCollaborator.id + '/addCollab', { 
                user: this.requestTaskUsername, 
                taskName: this.taskToAddCollaborator.name,
                mode,
            }, e);

            if (!bm || bm.error) {
                this.$emit('update:info', (bm && bm.error) || 'Something went wrong!');
                this.$emit('update:invite-confirm', null);
            } else {
                this.$emit('update:beatmap', bm);
                this.$emit('update:info', null);
                this.$emit('update:invite-confirm', 'Collab invite sent!');
            }
        },
    },
}
</script>
