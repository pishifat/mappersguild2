<template>
    <div class="container card card-body py-1">
        <h5 class="mt-2">
            Search beatmap in osu! API
        </h5>
        <input
            v-model="osuId"
            class="form-control form-control-sm mb-2"
            type="text"
            maxlength="18"
            autocomplete="off"
            placeholder="search by osuID..."
            @keyup.enter="searchBeatmap($event)"
        />
        <button class="btn btn-sm w-100 btn-info mb-2" @click="searchBeatmap($event)">
            Load beatmap
        </button>
        <div v-if="output">
            <copy-paste>
                <pre>{{ output }}</pre>
            </copy-paste>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CopyPaste from '../CopyPaste.vue';

export default defineComponent({
    name: 'OsuApiBeatmapSearch',
    components: {
        CopyPaste,
    },
    data() {
        return {
            osuId: null,
            output: null,
        };
    },
    methods: {
        async searchBeatmap(e): Promise<void> {
            const res: any = await this.$http.executePost('/admin/beatmaps/searchBeatmap', { osuId: this.osuId }, e);

            if (res && !res.error) {
                this.output = res;
            }
        },
    },
});
</script>
