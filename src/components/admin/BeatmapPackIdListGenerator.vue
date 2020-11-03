<template>
    <div class="container bg-container py-1 mb-4">
        <textarea
            v-model="inputUrls"
            class="form-control-sm mx-2 mt-2 w-100"
            type="text"
            autocomplete="off"
            placeholder="map URLs separated by newlines..."
        />
        <button class="btn btn-sm btn-block btn-outline-info" @click="generateBeatmapPackIdList()">
            Generate beatmap pack ID list
        </button>
        <div v-if="output.length">
            <copy-paste>
                {{ output }}
            </copy-paste>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CopyPaste from '../CopyPaste.vue';

export default Vue.extend({
    name: 'BeatmapPackIdListGenerator',
    components: {
        CopyPaste,
    },
    data() {
        return {
            inputUrls: '',
            output: '',
        };
    },
    methods: {
        findOsuId(url): number {
            const indexStart = url.indexOf('beatmapsets/') + 'beatmapsets/'.length;
            const indexEnd = url.indexOf('#');
            let bmId = '';

            if (indexEnd !== -1) {
                bmId = url.slice(indexStart, indexEnd);
            } else {
                bmId = url.slice(indexStart);
            }

            return parseInt(bmId, 10);
        },
        generateBeatmapPackIdList(): void {
            let text = '';

            const urls = this.inputUrls.split('\n');
            console.log(urls);

            for (const url of urls) {
                const id = this.findOsuId(url);

                if (isNaN(id)) text += `FAILED (${url})`;
                else text += id;

                text += ',';
            }

            this.output = text.substring(0, text.length-1);
        },
    },
});
</script>

<style>
</style>