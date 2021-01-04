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

            | <user-link class="me-1" :user="beatmap.host" />

            <modes-icons :modes="[beatmap.mode]" />
        </template>

        <template #default>
            <div class="container">
                <p class="row">
                    <select v-model="status" class="form-control form-control-sm w-50 mx-2">
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
                    <select v-model="taskId" class="form-control form-control-sm w-50 mx-2">
                        <option v-for="task in sortedTasks" :key="task.id" :value="task.id">
                            {{ task.name }} ---
                            {{ task.mappers.join(', ') }}
                            {{ task.name == 'Storyboard' ? ' --- ' + task.sbQuality : '' }}
                        </option>
                    </select>
                    <button class="btn btn-sm btn-outline-danger w-25" @click="deleteTask($event)">
                        Remove difficulty
                    </button>
                </p>
                <p class="row">
                    <select v-model="modderId" class="form-control form-control-sm w-50 mx-2">
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
                    >
                    <button class="btn btn-sm btn-outline-info w-25" @click="updateUrl($event)">
                        Save URL
                    </button>
                </p>
                <p v-if="storyboardTaskId" class="row">
                    <select v-model="storyboardQuality" class="form-control form-control-sm w-50 mx-2">
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
                    >
                    <button class="btn btn-sm btn-outline-info w-25" @click="updatePackId($event)">
                        Save pack ID
                    </button>
                </p>
                <p>
                    Featured Artist showcase:
                    <span class="text-danger me-2">{{ beatmap.isShowcase ? 'true' : 'false' }}</span>
                    <button class="btn btn-sm btn-outline-info" @click="updateIsShowcase($event)">
                        Toggle
                    </button>
                </p>
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

export default defineComponent({
    name: 'BeatmapInfoAdmin',
    components: {
        ModalDialog,
        ModesIcons,
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
                    message: `updated isShowcase`,
                    type: 'info',
                });
                this.$store.commit('updateIsShowcase', {
                    beatmapId: this.beatmap.id,
                    isShowcase,
                });
            }
        },
    },
});
</script>
