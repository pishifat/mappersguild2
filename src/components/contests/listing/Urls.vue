<template>
    <div class="row">
        <div class="col-sm-6">
            <div class="form-inline w-100">
                Contest details URL:
                <input
                    v-model="newUrl"
                    class="ml-1 form-control"
                    @change="updateUrl($event)"
                />
            </div>
        </div>
        <div class="col-sm-6">
            <div class="form-inline w-100">
                osu! contest listing URL:
                <div v-if="!newOsuContestListingUrl.includes('https://osu.ppy.sh/community/contests/')" class="small text-danger">Not saved. Only use this if your contest is <a href="https://osu.ppy.sh/community/contests/" target="_blank">hosted officially on osu!</a>.</div>
                <input
                    v-model="newOsuContestListingUrl"
                    class="ml-1 form-control"
                    @change="updateOsuContestListingUrl($event)"
                />
            </div>
        </div>
        <div class="col-sm-6">
            <div class="form-inline w-100">
                Results URL:
                <input
                    v-model="newResultsUrl"
                    class="ml-1 form-control"
                    @change="updateResultsUrl($event)"
                />
            </div>
        </div>
        <div class="col-sm-6">
            <div class="form-inline w-100">
                Banner URL:
                <input
                    v-model="newBannerUrl"
                    class="ml-1 form-control"
                    @change="updateBannerUrl($event)"
                />
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
        resultsUrl: {
            type: String,
            default: null,
        },
        bannerUrl: {
            type: String,
            default: null,
        },
    },
    data () {
        return {
            newUrl: this.url,
            newOsuContestListingUrl: this.osuContestListingUrl,
            newResultsUrl: this.resultsUrl,
            newBannerUrl: this.bannerUrl,
        };
    },
    watch: {
        contestId(): void {
            this.newUrl = this.url;
            this.newOsuContestListingUrl = this.osuContestListingUrl;
            this.newResultsUrl = this.resultsUrl;
            this.newBannerUrl = this.bannerUrl;
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
        async updateResultsUrl(e): Promise<void> {
            const resultsUrl = await this.$http.executePost(`/contests/listing/${this.contestId}/updateResultsUrl`, { url: this.newResultsUrl }, e);

            if (!this.$http.isError(resultsUrl)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated results url`,
                    type: 'info',
                });
                this.$store.commit('updateResultsUrl', {
                    contestId: this.contestId,
                    resultsUrl,
                });
            }
        },
        async updateBannerUrl(e): Promise<void> {
            const bannerUrl = await this.$http.executePost(`/contests/listing/${this.contestId}/updateBannerUrl`, { url: this.newBannerUrl }, e);

            if (!this.$http.isError(bannerUrl)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated banner url`,
                    type: 'info',
                });
                this.$store.commit('updateBannerUrl', {
                    contestId: this.contestId,
                    bannerUrl,
                });
            }
        },
    },
});
</script>