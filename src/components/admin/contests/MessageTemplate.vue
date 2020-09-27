<template>
    <div>
        <a :href="'https://osu.ppy.sh/community/chat?sendto=' + osuId" target="_blank">
            <button class="btn btn-sm btn-outline-info"> <!--  @click="sendResultsPm($event)" -->
                Send results PM
            </button>
        </a>
        <copy-paste :distinct="submissionId">
            hello, thank you for recently participating in "{{ contestName }}"!
            screening/judging details on your submission can be found here:
            https://mappersguild.com/contestresults?submission={{ submissionId }}
        </copy-paste>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CopyPaste from '../../CopyPaste.vue';

export default Vue.extend({
    name: 'MessageTemplate',
    components: {
        CopyPaste,
    },
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
        async sendResultsPm(e): Promise<void> { // waiting on https://github.com/ppy/osu-web/issues/6359
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
