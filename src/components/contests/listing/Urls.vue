<template>
    <div class="row">
        <div class="col-sm-6">
            <div class="form-inline w-100">
                Contest details URL:
                <input
                    v-model="newUrl"
                    class="ml-1 form-control"
                    @change="updateUrl($event)"
                >
            </div>
        </div>
        <div class="col-sm-6">
            <div class="form-inline w-100">
                osu! contest listing URL:
                <input
                    v-model="newOsuContestListingUrl"
                    class="ml-1 form-control"
                    @change="updateOsuContestListingUrl($event)"
                >
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Urls',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            default: null,
        },
        osuContestListingUrl: {
            type: String,
            default: null,
        },
    },
    data () {
        return {
            newUrl: this.url,
            newOsuContestListingUrl: this.osuContestListingUrl,
        };
    },
    watch: {
        contestId(): void {
            this.newUrl = this.url;
            this.newOsuContestListingUrl = this.osuContestListingUrl;
        },
    },
    methods: {
        async updateUrl(e): Promise<void> {
            const url = await this.$http.executePost(`/contests/listing/${this.contestId}/updateUrl`, { url: this.newUrl }, e);

            if (!this.$http.isError(url)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated contest url`,
                    type: 'info',
                });
                this.$store.commit('updateUrl', {
                    contestId: this.contestId,
                    url,
                });
            }
        },
        async updateOsuContestListingUrl(e): Promise<void> {
            const osuContestListingUrl = await this.$http.executePost(`/contests/listing/${this.contestId}/updateOsuContestListingUrl`, { url: this.newOsuContestListingUrl }, e);

            if (!this.$http.isError(osuContestListingUrl)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated osu! contest listing url`,
                    type: 'info',
                });
                this.$store.commit('updateOsuContestListingUrl', {
                    contestId: this.contestId,
                    osuContestListingUrl,
                });
            }
        },
    },
});
</script>