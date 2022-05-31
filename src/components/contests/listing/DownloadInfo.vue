<template>
    <div class="row">
        <div class="col-sm-6">
            Download:
            <span v-if="!download" class="me-2 text-secondary">No download</span>
            <input
                v-model="newDownload"
                class="form-control form-control-sm w-100 d-inline"
                type="text"
                autocomplete="off"
                placeholder="link..."
                @change="updateDownload($event)"
            >
        </div>
        <div class="col-sm-6 small text-secondary">
            This link will appear at the top of judging/screening pages for users to download beatmaps. For contest integrity, user data should be removed as explained in the anonymization guide below.
            <a
                v-if="download"
                :href="download"
                target="_blank"
            >Test the link here!</a>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'DownloadInfo',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        download: {
            type: String,
            default: null,
        },
    },
    data () {
        return {
            newDownload: this.download,
        };
    },
    methods: {
        async updateDownload(e): Promise<void> {
            const download = await this.$http.executePost(`/contests/listing/${this.contestId}/updateDownload`, { download: this.newDownload }, e);

            if (!this.$http.isError(download)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated contest submissions download link`,
                    type: 'info',
                });
                this.$store.commit('updateDownload', {
                    contestId: this.contestId,
                    download,
                });
            }
        },
    },
});
</script>

<style scoped>

.date-input {
    width: 10%;
}

</style>