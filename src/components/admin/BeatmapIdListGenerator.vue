<template>
    <div class="container card card-body py-2 mt-2">
        <h5>Beatmap pack ID list generator</h5>
        <textarea
            v-model="inputUrls"
            class="form-control form-control-sm mx-2 mb-2 w-100"
            type="text"
            autocomplete="off"
            placeholder="map URLs separated by newlines..."
        />
        <div class="form-inline">
            <div class="form-group">
                <button class="btn btn-sm btn-info me-2" @click="generateBeatmapCommaIdList()">
                    Generate (comma separated)
                </button>
                <button class="btn btn-sm btn-info" @click="generateBeatmapNewLineIdList()">
                    Generate (newlines)
                </button>
            </div>
        </div>
        <div v-if="output.length">
            <copy-paste>
                {{ output }}
            </copy-paste>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CopyPaste from '../CopyPaste.vue';

export default defineComponent({
    name: 'BeatmapIdListGenerator',
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
        generateBeatmapCommaIdList(): void {
            let text = '';

            const urls = this.inputUrls.split('\n');

            for (const url of urls) {
                const id = this.findOsuId(url);

                if (isNaN(id)) text += `FAILED (${url})`;
                else text += id;

                text += ',';
            }

            this.output = text.substring(0, text.length-1);
        },
        generateBeatmapNewLineIdList(): void {
            let text = '';

            const urls = this.inputUrls.split('\n');

            for (const url of urls) {
                const id = this.findOsuId(url);

                if (isNaN(id)) text += `FAILED (${url})`;
                else text += id;

                text += '\n';
            }

            this.output = text.substring(0, text.length-1);
        },
    },
});
</script>
