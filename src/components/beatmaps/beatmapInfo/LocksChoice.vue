<template>
    <div>
        <div id="locks" class="row mb-1">
            <div class="col">
                <div>
                    Locks
                </div>
                <div class="small ml-3">
                    <i v-if="beatmap.tasksLocked.length == 0">none</i>
                    <div v-if="beatmap.tasksLocked.length > 0">
                        <div
                            v-for="task in beatmap.tasksLocked"
                            :key="task.id"
                        >
                            <a
                                href="#"
                                class="text-danger"
                                @click.prevent="unlockTask(task)"
                                :class="fakeButton == task ? 'fake-button-disable' : ''"
                                data-toggle="tooltip"
                                data-placement="left"
                                title="unlock"
                            >
                                <i class="fas fa-minus"></i>
                            </a>
                            <span class="text-white-50">
                                {{ task }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row" v-if="beatmap.tasksLocked.length != 6">
            <div class="col">
                <div class="input-group input-group-sm">
                    <select class="form-control" v-model="lockTaskSelection">
                        <template
                            v-for="task in tasks"
                        >
                            <option value="">Choose a difficulty</option>
                            <option
                                v-if="canSelect(task)"
                                :value="task"
                            >
                                {{ task }}
                            </option>
                        </template>
                    </select>
                    <div class="input-group-append">
                        <button
                            class="btn btn-outline-info"
                            id="lockTask"
                            @click="lockTask($event)"
                            data-toggle="tooltip"
                            data-placement="right"
                            title="prevent other mappers from claiming a difficulty"
                        >
                            <i class="fas fa-lock"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from '../../../mixins.js';

export default {
    name: 'locks-choice',
    mixins: [ mixin ],
    props: {
        beatmap: Object,
    },
    watch: {
        beatmap: function() {
            this.fakeButton = null;
        },
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
            lockTaskSelection: null,
            fakeButton: null,
        }
    },
    methods: {
        canSelect (task) {
            return this.beatmap.tasksLocked.indexOf(task) == -1;
        },
        unlockTask: async function(task) {
            this.fakeButton = task;

            const bm = await this.executePost(
                '/beatmaps/unlockTask/' + this.beatmap._id, 
                { task }
            );

            if (bm) {
                this.editLinkInput = null;
                this.$emit('update:beatmap', bm);
            }
        },
        lockTask: async function(e) {
            this.fakeButton = null;

            const bm = await this.executePost(
                '/beatmaps/lockTask/' + this.beatmap._id,
                { task: this.lockTaskSelection },
                e
            );
            
            if (bm) {
                this.$emit('update:beatmap', bm);
            }
        },
    },
}
</script>
