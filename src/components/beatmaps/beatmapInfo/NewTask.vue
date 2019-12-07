<template>
    <div
        v-if="beatmap.status == 'WIP'"
        class="row mt-2"
        :class="
            beatmap.tasksLocked.length == 6 && !isHost ? 
            'fake-button-disable' : ''
        "
    >
        <div class="col form-inline">
            <div class="input-group input-group-sm">
                <select class="form-control" v-model="selectedTask">
                    <template
                        v-for="task in tasks"
                    >
                        <option
                            v-if="canSelect(task)"
                            :value="task"
                        >
                            {{ task }}
                        </option>
                    </template>
                </select>
                
                <select
                    v-if="beatmap.mode == 'hybrid'"
                    class="form-control"
                    v-model="selectedMode"
                >
                    <option value="osu">osu!</option>
                    <option value="taiko">osu!taiko</option>
                    <option value="catch">osu!catch</option>
                    <option value="mania">osu!mania</option>
                </select>

                <input
                    v-if="isHost"
                    class="form-control w-25"
                    type="text"
                    placeholder="request to... (if needed)"
                    maxlength="18"
                    v-model="requestTaskUsername"
                    @keyup.enter="requestTask(beatmap.id, $event)"
                />

                <button
                    class="btn btn-sm btn-outline-info ml-1"
                    @click="addTask(beatmap.id, $event)"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="add difficulty"
                    :disabled="requestDiffInput"
                >
                    <i class="fas fa-plus"></i>
                </button>
            </div>
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
    },
    data () {
        return {
            tasks: [
                'Easy',
                'Normal',
                'Hard',
                'Insane',
                'Expert',
                'Storyboard',
            ],
            selectedTask: 'Easy',
            selectedMode: 'osu',
            requestTaskUsername: null,
        }
    },
    methods: {
        canSelect (task) {
            return this.beatmap.tasksLocked.indexOf(task) == -1 || this.isHost
        },
        addTask: async function(id, e) {
            if (this.requestTaskUsername.length) {
                this.requestTask(id, e);
                return;
            }

            const bm = await this.executePost('/beatmaps/addTask/' + id, { 
                difficulty: this.selectedTask, 
                mode: this.selectedmode 
            }, e);

            if (bm) {
                this.$emit('update:beatmap', bm);
            }
        },
        requestTask: async function(id, e) {
            if (!this.selectedmode) {
                this.selectedmode = this.beatmap.mode;
            }

            const bm = await this.executePost('/beatmaps/requestTask/' + id, { 
                difficulty: this.selectedTask, 
                user: this.requestTaskUsername, 
                mode: this.selectedmode 
            }, e);

            if (bm) {
                this.$emit('update:beatmap', bm);
                this.$emit('update:info', null);
                this.$emit('update:invite-confirm', 'Difficulty request sent!');
            }
        },
    },
}
</script>

<style>

</style>