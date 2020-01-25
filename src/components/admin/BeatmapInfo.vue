<template>
    <div id="editBeatmap" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div v-if="beatmap" class="modal-content bg-dark">
                <div class="modal-header text-dark bg-rest">
                    <h5 class="modal-title">
                        <a
                            v-if="beatmap.url"
                            :href="beatmap.url"
                            class="text-dark"
                            target="_blank"
                        >
                            {{ beatmap.song.artist }} - {{ beatmap.song.title }}
                        </a>
                        <span v-else>{{ beatmap.song.artist }} - {{ beatmap.song.title }}</span>
                        (<a :href="'https://osu.ppy.sh/users/' + beatmap.host.osuId" class="text-dark" target="_blank">{{ beatmap.host.username }}</a>)
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <p class="form-row">
                        <select v-model="status" class="form-control form-control-sm w-25 mx-2">
                            <option value="WIP">
                                WIP
                            </option>
                            <option value="Done">
                                Done
                            </option>
                            <option value="Qualified">
                                Qualified
                            </option>
                            <option value="Ranked">
                                Ranked
                            </option>
                        </select>
                        <button class="btn btn-sm btn-outline-info" @click="updateBeatmapStatus($event)">
                            Save status
                        </button>
                    </p>
                    <p class="form-row">
                        <select v-model="taskId" class="form-control form-control-sm w-50 mx-2">
                            <option v-for="task in sortedTasks" :key="task.id" :value="task.id">
                                {{ task.name }} ---
                                <template v-for="(mapper, i) in task.mappers">
                                    {{ mapper.username + (i < task.mappers.length - 1 ? ', ' : '') }}
                                </template>
                                {{ task.name == 'Storyboard' ? ' --- ' + task.sbQuality : '' }}
                            </option>
                        </select>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteTask($event)">
                            Remove difficulty
                        </button>
                    </p>
                    <p class="form-row">
                        <select v-model="modderId" class="form-control form-control-sm w-50 mx-2">
                            <option v-for="modder in beatmap.modders" :key="modder.id" :value="modder.id">
                                {{ modder.username }}
                            </option>
                        </select>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteModder($event)">
                            Remove modder
                        </button>
                    </p>
                    <p v-if="beatmap.url" class="min-spacing small text-white-50">
                        Current URL:
                        <a :href="beatmap.url" target="_blank">{{ beatmap.url }}</a>
                    </p>
                    <p>
                        <input
                            v-model="beatmapUrl"
                            class="form-control-sm mx-2 w-75"
                            type="text"
                            autocomplete="off"
                            placeholder="beatmap url..."
                        >
                        <button class="btn btn-sm btn-outline-info" @click="updateUrl($event)">
                            Save URL
                        </button>
                    </p>
                    <p v-if="storyboardTaskId" class="form-row">
                        <select v-model="storyboardQuality" class="form-control form-control-sm w-25 mx-2">
                            <option value="1">
                                1
                            </option>
                            <option value="2">
                                2
                            </option>
                            <option value="3">
                                3
                            </option>
                        </select>
                        <button class="btn btn-sm btn-outline-info" @click="updateStoryboardQuality($event)">
                            Save Storyboard Quality
                        </button>
                    </p>
                    <p>
                        <input
                            v-model="packId"
                            class="form-control-sm mx-2 w-50"
                            type="text"
                            autocomplete="off"
                            placeholder="osu! beatmap pack ID..."
                        >
                        <button class="btn btn-sm btn-outline-info" @click="updatePackId($event)">
                            Save pack ID
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'BeatmapInfo',
    props: {
        beatmap: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            status: null,
            taskId: null,
            modderId: null,
            beatmapUrl: null,
            storyboardQuality: null,
            storyboardTaskId: null,
            packId: null,
        };
    },
    computed: {
        sortedTasks(): object[] {
            const sortOrder = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'];

            return [...this.beatmap.tasks].sort(function(a, b) {
                return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
            });
        },
    },
    watch: {
        beatmap(): void {
            this.status = this.beatmap.status;
            this.taskId = null;
            this.modderId = null;
            this.beatmapUrl = this.beatmap.url;
            this.storyboardQuality = null;
            this.storyboardTaskId = null;
            this.packId = this.beatmap.packId;
            this.beatmap.tasks.forEach(task => {
                if (task.name == 'Storyboard') {
                    if (task.sbQuality) this.storyboardQuality = task.sbQuality;
                    this.storyboardTaskId = task.id;
                }
            });
        },
    },
    methods: {
        async updateBeatmapStatus(e): Promise<void> {
            const b = await this.executePost('/admin/updateBeatmapStatus/' + this.beatmap.id, { status: this.status }, e);

            if (b) {
                this.$emit('update-beatmap', b);
            }
        },
        async deleteTask(e): Promise<void> {
            const b = await this.executePost('/admin/deleteTask/' + this.beatmap.id, { taskId: this.taskId }, e);

            if (b) {
                this.$emit('update-beatmap', b);
            }
        },
        async deleteModder(e): Promise<void> {
            const b = await this.executePost('/admin/deleteModder/' + this.beatmap.id, { modderId: this.modderId }, e);

            if (b) {
                this.$emit('update-beatmap', b);
            }
        },
        async updateUrl(e): Promise<void> {
            const b = await this.executePost('/admin/updateUrl/' + this.beatmap.id, { url: this.beatmapUrl }, e);

            if (b) {
                this.$emit('update-beatmap', b);
            }
        },
        async updateStoryboardQuality(taskId, e): Promise<void> {
            const b = await this.executePost('/admin/updateStoryboardQuality/' + this.beatmap.id, { storyboardQuality: this.storyboardQuality, taskId: this.storyboardTaskId }, e);

            if (b) {
                this.$emit('update-beatmap', b);
            }
        },
        async updatePackId(e): Promise<void> {
            const b = await this.executePost('/admin/updatePackId/' + this.beatmap.id, { packId: this.packId }, e);

            if (b) {
                this.$emit('update-beatmap', b);
            }
        },
    },
});
</script>