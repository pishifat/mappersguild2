<template>
    <div>
        <p class="text-white-50">
            Download:
            <a v-if="!showDownloadInput && download" :href="download" target="_blank">
                {{ download }}
            </a>
            <span v-else-if="!showDownloadInput">No download</span>
            <input
                v-else
                v-model="newDownload"
                class="form-control form-control-sm w-50 d-inline"
                type="text"
                autocomplete="off"
                placeholder="link..."
                @change="updateDownload($event)"
            >
            <a href="#" class="ms-1 d-inline" @click.prevent="showDownloadInput = !showDownloadInput">
                <i class="fas fa-edit" />
            </a>
        </p>
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
            showDownloadInput: false,
        };
    },
    methods: {
        async updateDownload(e): Promise<void> {
            const download = await this.$http.executePost(`/admin/contests/${this.contestId}/updateDownload`, { download: this.newDownload }, e);

            if (!this.$http.isError(download)) {
                this.showDownloadInput = false;
                this.$store.dispatch('updateToastMessages', {
                    message: `updated contest start date`,
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