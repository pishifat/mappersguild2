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

            <modes-icons
                :modes="[beatmap.mode]"
                color="dark"
            />
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
                <span v-if="beatmap.status == 'Qualified'">
                    <div v-if="beatmap.rankedDate" class="mb-2 small">
                        <ul>
                            <li>Host join date: <span class="text-secondary">{{ beatmap.host.createdAt }}</span></li>
                            <li>Ranked: <span class="text-secondary">{{ beatmap.rankedDate }}</span></li>
                        </ul>
                    </div>
                    <div class="row mb-2">
                        <span class="col-sm-6">
                            Queued for rank:
                            <span class="text-danger me-2">{{ beatmap.queuedForRank ? 'true' : 'false' }}</span>
                        </span>
                        <button class="btn btn-sm btn-outline-info ms-3 w-25" @click="updateQueuedForRank($event)">
                            Toggle
                        </button>
                    </div>
                    <div class="row mb-2">
                        <span class="col-sm-6">
                            Skip webhook:
                            <span class="text-danger me-2">{{ beatmap.skipWebhook ? 'true' : 'false' }}</span>
                        </span>
                        <button class="btn btn-sm btn-outline-info ms-3 w-25" @click="updateSkipWebhook($event)">
                            Toggle
                        </button>
                    </div>
                    <p class="row">
                        <textarea
                            v-model="rejectionInput"
                            class="form-control form-control-sm w-25"
                            type="text"
                            autocomplete="off"
                            placeholder="message..."
                            rows="1"
                        />
                        <button class="btn btn-sm btn-outline-info ms-2 w-25" @click="rejectMapset($event, true)">
                            Reject with resolution
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-2 w-25" @click="rejectMapset($event, false)">
                            Reject without resolution
                        </button>
                    </p>
                    <hr />
                </span>
                <div class="row mb-2">
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
                </div>
                <div class="row mb-2">
                    <select v-model="modderId" class="form-select form-select-sm w-50 mx-2">
                        <option v-for="modder in beatmap.modders" :key="modder.id" :value="modder.id">
                            {{ modder.username }}
                        </option>
                    </select>
                    <button class="btn btn-sm btn-outline-danger w-25" @click="deleteModder($event)">
                        Remove modder
                    </button>
                </div>
                <div class="row mb-2">
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
                </div>
                <div class="row mb-2">
                    <span class="col-sm-6">
                        Featured Artist showcase:
                        <span class="text-danger me-2">{{ beatmap.isShowcase ? 'true' : 'false' }}</span>
                    </span>
                    <button class="btn btn-sm btn-outline-info ms-3 w-25" @click="updateIsShowcase($event)">
                        Toggle
                    </button>
                </div>
            </div>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalDialog from '@components/ModalDialog.vue';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';
import { Task, SortedTasks } from '../../../interfaces/beatmap/task';
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
            rejectionInput: '',
        };
    },
    computed: {
        sortedTasks(): Task[] {
            const sortOrder = SortedTasks;

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
            this.rejectionInput = '';
        },
        findTaskInfo(task): string {
            let text = `${task.name} --- `;
            const mappers = task.mappers.map(m => m.username);
            text += mappers.join(', ');

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
        async updateSkipWebhook(e): Promise<void> {
            const skipWebhook = await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/updateSkipWebhook`, { skipWebhook: !this.beatmap.skipWebhook }, e);

            if (!this.$http.isError(skipWebhook)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated skipWebhook: ${skipWebhook}`,
                    type: 'info',
                });
                this.$store.commit('updateSkipBeatmapWebhook', {
                    beatmapId: this.beatmap.id,
                    skipWebhook,
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
