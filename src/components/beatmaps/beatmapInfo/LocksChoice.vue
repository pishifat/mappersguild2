<template>
    <div>
        <div id="locks" class="row mb-1">
            <div class="col">
                <div>
                    Locks
                    <a
                        v-if="beatmap.tasksLocked.length < 6"
                        v-bs-tooltip:right="'edit locks'"
                        class="text-success small ms-1"
                        href="#"
                        @click.prevent="showLocksInput = !showLocksInput"
                    >
                        <i class="fas fa-edit" />
                    </a>
                </div>
                <div class="small ms-3">
                    <i v-if="beatmap.tasksLocked.length == 0">none</i>
                    <div v-if="beatmap.tasksLocked.length > 0">
                        <div
                            v-for="task in beatmap.tasksLocked"
                            :key="task"
                        >
                            <a
                                v-bs-tooltip:left="'unlock'"
                                href="#"
                                class="text-danger"
                                :class="phaseEdit ? 'fake-button-disable' : ''"
                                @click.prevent="unlockTask(task, $event)"
                            >
                                <i class="fas fa-minus" />
                            </a>
                            <span class="text-white-50 mx-1">
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
                    <button
                        id="lockTask"
                        v-bs-tooltip:right="'prevent other mappers from claiming a difficulty'"
                        class="btn btn-outline-info"
                        @click="lockTask($event)"
                    >
                        <i class="fas fa-lock" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';
import { TaskName } from '../../../../interfaces/beatmap/task';

export default defineComponent({
    name: 'LocksChoice',
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
        beatmapId: {
            type: String,
            required: true,
        },
    },
    data () {
        return {
            lockTaskSelection: '',
            showLocksInput: false,
            phaseEdit: false,
        };
    },
    computed: {
        remainingTasks(): string[] {
            let possibleTasks: TaskName[] = Object.values(TaskName);

            if (this.beatmap?.tasksLocked?.length) {
                possibleTasks = possibleTasks.filter(t => !this.beatmap.tasksLocked.includes(t));
            }

            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.lockTaskSelection = possibleTasks[0] || '';

            return possibleTasks;
        },
    },
    watch: {
        beatmapId (): void {
            this.showLocksInput = false;
        },
    },
    methods: {
        async unlockTask(task, e): Promise<void> {
            e.target.classList.add('fake-button-disable');

            const bm = await this.$http.executePost<Beatmap>(
                `/beatmaps/${this.beatmap.id}/unlockTask`,
                { task }
            );

            if (!this.$http.isError(bm)) {
                this.$store.dispatch('beatmaps/updateBeatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },
        async lockTask(e): Promise<void> {
            const bm = await this.$http.executePost<Beatmap>(
                `/beatmaps/${this.beatmap.id}/lockTask`,
                { task: this.lockTaskSelection },
                e
            );

            if (!this.$http.isError(bm)) {
                this.$store.dispatch('beatmaps/updateBeatmap', bm);
            }
        },
    },
});
</script>