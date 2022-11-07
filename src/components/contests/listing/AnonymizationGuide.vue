<template>
    <div class="mx-4">
        Submissions must be anonymized locally, then transferred to Mappers' Guild. You have 3 options:
        <ol>
            <li>Follow instructions on the <a href="https://github.com/pishifat/contest-anonymization#readme" target="_blank">contest anonymization GitHub repository</a>.</li>
            <li>Ask <a href="https://osu.ppy.sh/users/3178418" target="_blank">pishifat</a> to do option 1 for you.</li>
            <li>Manually anonymize entries (please don't waste your time with this).</li>
        </ol>

        <div>
            <span class="small text-secondary">If you succeed with step 1, paste your <code>.csv</code> output here as raw text to replace anonymized names:</span>

            <div class="row">
                <div class="col-sm-10">
                    <textarea
                        v-model="csvOutput"
                        class="form-control form-inline"
                        rows="1"
                    />
                </div>
                <div class="col-sm-2">
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-info mt-1 mx-1"
                        @click="applyCsvOutput($event)"
                    >
                        Save
                    </button>
                </div>
            </div>
            <div v-if="errors.length" class="small text-warning">
                The following submissions could not be processed and will need to be renamed manually:
                <ul>
                    <li v-for="error in errors" :key="error">
                        {{ error }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'AnonymizationGuide',
    props: {
        contestId: {
            type: String,
            required: true,
        },
    },
    data () {
        return {
            csvOutput: '',
            errors: [],
        };
    },
    methods: {
        async applyCsvOutput(e): Promise<void> {
            const res: any = await this.$http.executePost(`/contests/listing/${this.contestId}/submissions/syncAnonymousNames`, { csv: this.csvOutput }, e);

            if (!this.$http.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated submission names`,
                    type: 'info',
                });
                this.$store.commit('updateSubmissions', {
                    contestId: this.contestId,
                    submissions: res.submissions,
                });

                if (res.errors.length) {
                    this.errors = res.errors;
                }
            }
        },
    },
});
</script>