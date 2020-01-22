<template>
    <div>
        <div id="locks" class="row mb-1">
            <div class="col">
                <div>
                    Locks
                    <a
                        v-if="selectedBeatmap.tasksLocked.length != 6"
                        class="text-success small ml-1"
                        href="#"
                        @click.prevent="showLocksInput = !showLocksInput"
                    >
                        <i class="fas fa-edit" />
                    </a>
                </div>
                <div class="small ml-3">
                    <i v-if="selectedBeatmap.tasksLocked.length == 0">none</i>
                    <div v-if="selectedBeatmap.tasksLocked.length > 0">
                        <div
                            v-for="task in selectedBeatmap.tasksLocked"
                            :key="task.id"
                        >
                            <a
                                href="#"
                                class="text-danger"
                                data-toggle="tooltip"
                                data-placement="left"
                                title="unlock"
                                @click.prevent="unlockTask(task, $event)"
                            >
                                <i class="fas fa-minus" />
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
                            v-for="task in remainingTasks"
                            :key="task"
                            :value="task"
                        >
                            {{ task }}
                        </option>
                    </select>
                    <div class="input-group-append">
                        <button
                            id="lockTask"
                            class="btn btn-outline-info"
                            data-toggle="tooltip"
                            data-placement="right"
                            title="prevent other mappers from claiming a difficulty"
                            @click="lockTask($event)"
                        >
                            <i class="fas fa-lock" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { Beatmap } from '@srcModels/beatmap';

export default Vue.extend({
    name: 'LocksChoice',
    data () {
        return {
            lockTaskSelection: '',
            showLocksInput: false,
        };
    },
    computed: {
        ...mapState([
            'selectedBeatmap',
        ]),
        remainingTasks(): string[] {
            let possibleTasks = [
                'Easy',
                'Normal',
                'Hard',
                'Insane',
                'Expert',
                'Storyboard',
            ];

            if (this.selectedBeatmap?.tasksLocked?.length) {
                possibleTasks = possibleTasks.filter(t => !this.selectedBeatmap.tasksLocked.includes(t));
            }

            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.lockTaskSelection = possibleTasks[0] || '';

            return possibleTasks;
        },
    },
    watch: {
        selectedBeatmap (): void {
            this.showLocksInput = false;
        },
    },
    methods: {
        async unlockTask(task, e): Promise<void> {
            e.target.classList.add('fake-button-disable');

            const bm = await this.executePost(
                '/beatmaps/unlockTask/' + this.selectedBeatmap._id,
                { task }
            );

            if (bm) {
                this.$store.dispatch('updateBeatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },
        async lockTask(e): Promise<void> {
            const bm = await this.executePost<Beatmap>(
                '/beatmaps/lockTask/' + this.selectedBeatmap._id,
                { task: this.lockTaskSelection },
                e
            );

            if (this.isError(bm)) {
                this.$emit('update:info', bm.error);
            } else {
                this.$store.dispatch('updateBeatmap', bm);
            }
        },
    },
});
</script>
