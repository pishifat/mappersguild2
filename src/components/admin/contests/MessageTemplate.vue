<template>
    <div>
        <button class="btn btn-sm btn-outline-info" @click="sendResultsPm($event)">
            Send results PM
        </button>
        <div class="copy-paste small text-white-50">
            <samp>
                hello, thank you for recently participating in "{{ contestName }}"!
                screening/judging details on your submission can be found here:
                https://mappersguild.com/contestresults?submission={{ submissionId }}
            </samp>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'MessageTemplate',
    props: {
        osuId: {
            type: Number,
            default: 0,
        },
        submissionId: {
            type: String,
            required: true,
        },
        contestName: {
            type: String,
            required: true,
        },
    },
    methods: {
        async sendResultsPm(e): Promise<void> {
            const res = await this.executePost(`/admin/contests/sendResultsPm`, { contestName: this.contestName, submissionId: this.submissionId, osuId: this.osuId }, e);

            if (!this.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `sent results pm`,
                    type: 'info',
                });
            }
        },
    },
});
</script>
