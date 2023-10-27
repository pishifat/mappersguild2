<template>
    <modal-dialog id="editBeatmap" :loaded="Boolean(beatmap)">
        <template #header>
            <a
                v-if="beatmap.url"
                :href="beatmap.url"
                target="_blank"
            >
                {{ beatmap.song.artist }} - {{ beatmap.song.title }}
            </a>

            <span v-else>{{ beatmap.song.artist }} - {{ beatmap.song.title }}</span>

            | <a :href="`/beatmaps?id=${beatmap.id}`" target="_blank">MG url</a>

            | <user-link class="me-1" :user="beatmap.host" />

            <modes-icons :modes="[beatmap.mode]" />
        </template>

        <template #default>
            <div class="container">
                <div class="row">
                    <tasks-choice
                        :beatmap="beatmap"
                        :is-host="true"
                        :is-qualified="false"
                        :is-ranked="false"
                        :is-admin="true"
                    />
                </div>
                <p class="row">
                    <select v-model="taskId" class="form-select form-select-sm w-50 mx-2">
                        <option v-for="task in sortedTasks" :key="task.id" :value="task.id">
                            {{ findTaskInfo(task) }}
                        </option>
                    </select>
                    <button class="btn btn-sm btn-outline-danger w-25" @click="deleteTask($event)">
                        Remove difficulty
                    </button>
                </p>
                <hr />
                <p class="row">
                    <select v-model="status" class="form-select form-select-sm w-50 mx-2">
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
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateBeatmapStatus($event)">
                        Save status
                    </button>
                </p>
                <p class="row">
                    <select v-model="modderId" class="form-select form-select-sm w-50 mx-2">
                        <option v-for="modder in beatmap.modders" :key="modder.id" :value="modder.id">
                            {{ modder.username }}
                        </option>
                    </select>
                    <button class="btn btn-sm btn-outline-danger w-25" @click="deleteModder($event)">
                        Remove modder
                    </button>
                </p>
                <p class="row">
                    <input
                        v-model="beatmapUrl"
                        class="form-control form-control-sm mx-2 w-50"
                        type="text"
                        autocomplete="off"
                        placeholder="beatmap url..."
                    />
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateUrl($event)">
                        Save URL
                    </button>
                </p>
                <p v-if="storyboardTaskId" class="row">
                    <select v-model="storyboardQuality" class="form-select form-select-sm w-50 mx-2">
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
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateStoryboardQuality($event)">
                        Save Storyboard Quality
                    </button>
                </p>
                <p class="row">
                    <input
                        v-model="packId"
                        class="form-control form-control-sm mx-2 w-50"
                        type="text"
                        autocomplete="off"
                        placeholder="osu! beatmap pack ID..."
                    />
                    <button class="btn btn-sm btn-outline-info w-25" @click="updatePackId($event)">
                        Save pack ID
                    </button>
                </p>
                <p class="row">
                    <span class="col-sm-6">
                        Featured Artist showcase:
                        <span class="text-danger me-2">{{ beatmap.isShowcase ? 'true' : 'false' }}</span>
                    </span>
                    <button class="btn btn-sm btn-outline-info ms-3 w-25" @click="updateIsShowcase($event)">
                        Toggle
                    </button>
                </p>
                <span v-if="beatmap.status == 'Qualified'">
                    <p class="row">
                        <span class="col-sm-6">
                            Queued for rank:
                            <span class="text-danger me-2">{{ beatmap.queuedForRank ? 'true' : 'false' }}</span>
                        </span>
                        <button class="btn btn-sm btn-outline-info ms-3 w-25" @click="updateQueuedForRank($event)">
                            Toggle
                        </button>
                    </p>
                    <p class="row">
                        <textarea
                            v-model="rejectionInput"
                            class="form-control form-control-sm w-25"
                            type="text"
                            autocomplete="off"
                            placeholder="messages separated by new lines..."
                        />
                        <button class="btn btn-sm btn-outline-info ms-2 w-25" @click="rejectMapset($event, true)">
                            Reject with resolution option
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-2 w-25" @click="rejectMapset($event, false)">
                            Reject WITHOUT resolution
                        </button>
                    </p>
                </span>
            </div>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalDialog from '@components/ModalDialog.vue';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';
import { SBQuality, Task } from '../../../interfaces/beatmap/task';
import ModesIcons from '@components/ModesIcons.vue';
import TasksChoice from '../beatmaps/beatmapInfo/TasksChoice.vue';

export default defineComponent({
    name: 'BeatmapInfoAdmin',
    components: {
        ModalDialog,
        ModesIcons,
        TasksChoice,
    },
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    data() {
        return {
            status: this.beatmap.status,
            taskId: null,
            modderId: null,
            beatmapUrl: this.beatmap.url,
            storyboardQuality: null as null | SBQuality,
            storyboardTaskId: null as null | string,
            packId: this.beatmap.packId,
            rejectionInput: '',
        };
    },
    computed: {
        sortedTasks(): Task[] {
            const sortOrder = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'];

            return [...this.beatmap.tasks].sort(function(a, b) {
                return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
            });
        },
    },
    watch: {
        beatmap(): void {
            this.findBeatmapInfo();
        },
    },
    mounted() {
        this.findBeatmapInfo();
    },
    methods: {
        findBeatmapInfo(): void {
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
            this.rejectionInput = '';
        },
        findTaskInfo(task): string {
            let text = `${task.name} --- `;
            const mappers = task.mappers.map(m => m.username);
            text += mappers.join(', ');

            if (task.name == 'Storyboard') text += ` --- ${task.sbQuality}`;

            return text;
        },
        async updateBeatmapStatus(e): Promise<void> {
            const status = await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/updateStatus`, { status: this.status }, e);

            if (!this.$http.isError(status)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated beatmap status`,
                    type: 'info',
                });
                this.$store.commit('updateBeatmapStatus', {
                    beatmapId: this.beatmap.id,
                    status,
                });
            }
        },
        async deleteTask(e): Promise<void> {
            const res = await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/tasks/${this.taskId}/delete`, {}, e);

            if (!this.$http.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `deleted task`,
                    type: 'info',
                });
                this.$store.commit('deleteTask', {
                    beatmapId: this.beatmap.id,
                    taskId: this.taskId,
                });
            }
        },
        async deleteModder(e): Promise<void> {
            const res = await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/modders/${this.modderId}/delete`, {}, e);

            if (!this.$http.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `deleted modder`,
                    type: 'info',
                });
                this.$store.commit('deleteModder', {
                    beatmapId: this.beatmap.id,
                    modderId: this.modderId,
                });
            }
        },
        async updateUrl(e): Promise<void> {
            const url = await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/updateUrl`, { url: this.beatmapUrl }, e);

            if (!this.$http.isError(url)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated URL`,
                    type: 'info',
                });
                this.$store.commit('updateUrl', {
                    beatmapId: this.beatmap.id,
                    url,
                });
            }
        },
        async updateStoryboardQuality(e): Promise<void> {
            const task = await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/updateStoryboardQuality`, { storyboardQuality: this.storyboardQuality, taskId: this.storyboardTaskId }, e);

            if (!this.$http.isError(task)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated storyboard quality`,
                    type: 'info',
                });
                this.$store.commit('updateStoryboardQuality', {
                    beatmapId: this.beatmap.id,
                    taskId: this.storyboardTaskId,
                    task,
                });
            }
        },
        async updatePackId(e): Promise<void> {
            const packId = await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/updatePackId`, { packId: this.packId }, e);

            if (!this.$http.isError(packId)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated pack id`,
                    type: 'info',
                });
                this.$store.commit('updatePackId', {
                    beatmapId: this.beatmap.id,
                    packId,
                });
            }
        },
        async updateIsShowcase(e): Promise<void> {
            const isShowcase = await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/updateIsShowcase`, { isShowcase: !this.beatmap.isShowcase }, e);

            if (!this.$http.isError(isShowcase)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated isShowcase: ${isShowcase}`,
                    type: 'info',
                });
                this.$store.commit('updateIsShowcase', {
                    beatmapId: this.beatmap.id,
                    isShowcase,
                });
            }
        },
        async updateQueuedForRank(e): Promise<void> {
            const queuedForRank = await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/updateQueuedForRank`, { queuedForRank: !this.beatmap.queuedForRank }, e);

            if (!this.$http.isError(queuedForRank)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated queuedForRank: ${queuedForRank}`,
                    type: 'info',
                });
                this.$store.commit('updateQueuedForRank', {
                    beatmapId: this.beatmap.id,
                    queuedForRank,
                });
            }
        },
        async rejectMapset(e, isResolvable): Promise<void> {
            const result = confirm(`Are you sure?`);

            if (result) {
                const status = await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/rejectMapset`, { messages: this.rejectionInput, isResolvable }, e);

                if (!this.$http.isError(status)) {
                    this.$store.dispatch('updateToastMessages', {
                        message: `updated beatmap status`,
                        type: 'info',
                    });
                    this.$store.commit('updateBeatmapStatus', {
                        beatmapId: this.beatmap.id,
                        status,
                    });
                }
            }
        },
    },
});
</script>
