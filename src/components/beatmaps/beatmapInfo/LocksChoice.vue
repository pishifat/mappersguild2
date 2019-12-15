<template>
    <div>
        <div id="locks" class="row mb-1">
            <div class="col">
                <div>
                    Locks 
                    <a 
                        v-if="beatmap.tasksLocked.length != 6"
                        @click.prevent="showLocksInput = !showLocksInput"
                        class="text-success small ml-1"
                        href="#"
                    >
                        <i class="fas fa-edit"></i>
                    </a>
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
                                @click.prevent="unlockTask(task, $event)"
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

        <div 
            v-if="showLocksInput"
            class="row"
        >
            <div class="col">
                <div class="input-group input-group-sm">
                    <select
                        v-model="lockTaskSelection"
                        class="form-control"
                    >
                        <option
                            v-for="task in remaningTasks"
                            :value="task"
                        >
                            {{ task }}
                        </option>
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
        beatmap () {
            this.showLocksInput = false;
            this.sortDiffs();
        }
    },
    mounted () {
        this.sortDiffs();
    },
    computed: {
        remaningTasks() {
            let possibleTasks = [
                'Easy',
                'Normal',
                'Hard',
                'Insane',
                'Expert',
                'Storyboard',
            ];

            if (this.beatmap && this.beatmap.tasksLocked && this.beatmap.tasksLocked.length) {
                possibleTasks = possibleTasks.filter(t => !this.beatmap.tasksLocked.includes(t));
                
            }
            
            this.lockTaskSelection = possibleTasks[0] || null;
            return possibleTasks;
        },
    },
    data () {
        return {
            lockTaskSelection: null,
            showLocksInput: false,
        }
    },
    methods: {
        unlockTask: async function(task, e) {
            e.target.classList.add('fake-button-disable');

            const bm = await this.executePost(
                '/beatmaps/unlockTask/' + this.beatmap._id, 
                { task }
            );

            if (bm) {
                this.editLinkInput = null;
                this.$emit('update:beatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },
        lockTask: async function(e) {
            const bm = await this.executePost(
                '/beatmaps/lockTask/' + this.beatmap._id,
                { task: this.lockTaskSelection },
                e
            );
            
            if (!bm || bm.error) {
                this.$emit('update:info', (bm && bm.error) || 'Something went wrong!');
            } else {
                this.$emit('update:beatmap', bm);
            }
        },
        sortDiffs: function() {
            let sortOrder = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'];
            this.beatmap.tasksLocked.sort(function(a, b) {
                return sortOrder.indexOf(a) - sortOrder.indexOf(b);
            });
        }
    },
}
</script>
