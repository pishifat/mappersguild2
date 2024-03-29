<template>
    <div>
        <div id="locks" class="row mb-1">
            <div class="col">
                <div>
                    Locks
                    <a
                        v-if="beatmap.mode == 'taiko' ? beatmap.tasksLocked.length < 6 : beatmap.tasksLocked.length < 7"
                        v-bs-tooltip:right="'edit locks'"
                        class="text-success small ms-1"
                        :class="{ 'text-danger': showLocksInput }"
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
                            <span class="text-secondary mx-1">
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
import { Beatmap, BeatmapMode } from '../../../../interfaces/beatmap/beatmap';
import { Task, SortedTasks, TaskName } from '../../../../interfaces/beatmap/task';

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
            let possibleTasks = SortedTasks;

            if (this.beatmap?.tasksLocked?.length) {
                possibleTasks = possibleTasks.filter(t => !this.beatmap.tasksLocked.includes(t as Task['name']));
            }

            if (this.beatmap.mode == BeatmapMode.Taiko) {
                possibleTasks = possibleTasks.filter(t => t !== TaskName.Hitsounds);
            }

            return possibleTasks;
        },
    },
    watch: {
        beatmapId (): void {
            this.showLocksInput = false;
        },
        beatmap (): void {
            if (this.beatmap.tasksLocked.length >= 6) {
                this.showLocksInput = false;
            }
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