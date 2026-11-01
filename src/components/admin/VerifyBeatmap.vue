<template>
    <div v-if="beatmap.url" class="mb-2">
        <button class="btn btn-sm btn-outline-info w-25" @click="verify($event)">
            Compare MG vs. osu! diffs
        </button>
        <div v-if="verification" class="small mt-2">
            <div v-if="!verification.metadata.match" class="text-secondary">
                <ul>
                    <li>osu!: <span class="text-danger">{{ verification.metadata.osu }}</span></li>
                    <li>MG: <span class="text-danger">{{ verification.metadata.mg }}</span></li>
                </ul>
                <button class="btn btn-sm btn-outline-danger mb-2" @click="syncMetadata($event)">
                    Sync MG metadata to osu!
                </button>
            </div>
            <div v-else class="text-success">
                Metadata is consistent
            </div>
            <div v-if="verification.difficultiesMatch" class="text-success">
                Difficulties are consistent <small>(probably)</small>
            </div>
            <div v-else class="text-danger">
                Difficulties are inconsistent
            </div>
            <div v-if="verification.manual.length" class="text-secondary">
                Manually check:
                <i v-for="(task, i) in verification.manual" :key="i">
                    {{ task.name }} by
                    <user-link-list :users="task.mappers" />
                    <template v-if="i < verification.manual.length - 1">, </template>
                </i>
            </div>
        </div>
        <hr />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Beatmap } from '@interfaces/beatmap/beatmap';
import UserLinkList from '@components/UserLinkList.vue';

export default defineComponent({
    name: 'VerifyBeatmap',
    components: {
        UserLinkList,
    },
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    data() {
        return {
            verification: null as any,
        };
    },
    watch: {
        beatmap(): void {
            this.verification = null;
        },
    },
    methods: {
        async verify(e): Promise<void> {
            const res = await this.$http.executeGet<any>(`/admin/beatmaps/${this.beatmap.id}/verify`, e);

            if (!this.$http.isError(res)) {
                this.verification = res;
            }
        },
        async syncMetadata(e): Promise<void> {
            if (!confirm(`Are you sure?`)) return;

            const res = await this.$http.executePost<any>(`/admin/beatmaps/${this.beatmap.id}/syncMetadata`, {}, e);

            if (!this.$http.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `synced metadata: ${res.artist} - ${res.title}`,
                    type: 'info',
                });
                this.$store.commit('updateSongMetadata', {
                    beatmapId: this.beatmap.id,
                    ...res,
                });
                this.verification.metadata.mg = `${res.artist} - ${res.title}`;
                this.verification.metadata.match = true;
            }
        },
    },
});
</script>
