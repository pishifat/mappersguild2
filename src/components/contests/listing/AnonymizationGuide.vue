<template>
    <div class="mx-4">
        Submissions must be anonymized locally, then transferred to Mappers' Guild. You have 3 options:
        <ol>
            <li>Follow instructions on the <a href="https://github.com/pishifat/contest-anonymization#readme" target="_blank">contest anonymization GitHub repository</a>.</li>
            <li>Ask <a href="https://osu.ppy.sh/users/3178418" target="_blank">pishifat</a> to do option 1 for you.</li>
            <li>Manually clean entries and input</li>
        </ol>

        <div>
            If you succeed with step 1, paste your <code>.csv</code> output here as raw text:

            <div class="row">
                <div class="col-sm-10">
                    <textarea
                        v-model="csvOutput"
                        class="form-control form-inline"
                        @change="updateDescription($event)"
                    />
                </div>
                <div class="col-sm-2">
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-info mt-1 mx-1"
                        @click="applyCsvOutput()"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'AnonymizationGuide',
    data () {
        return {
            csvOutput: null,
        };
    },
});
</script>