<template>
    <modal-dialog id="editContest" :loaded="Boolean(contest)">
        <template #header>
            <a :href="`/contests/listing?contest=${contest.id}`" target="_blank">{{ contest.name }}</a>
        </template>

        <template #default>
            <div class="container">
                <p class="row">
                    <span class="col-sm-6">
                        Featured Artist contest:
                        <span class="text-danger me-2">{{ contest.isFeaturedArtistContest ? 'true' : 'false' }}</span>
                    </span>
                    <button class="btn btn-sm btn-outline-info ms-3 w-25" @click="toggleIsFeaturedArtistContest($event)">
                        Toggle
                    </button>
                </p>
                <p class="row">
                    <span class="col-sm-6">
                        Eligible for points:
                        <span class="text-danger me-2">{{ contest.isEligibleForPoints ? 'true' : 'false' }}</span>
                    </span>
                    <button class="btn btn-sm btn-outline-info ms-3 w-25" @click="toggleIsEligibleForPoints($event)">
                        Toggle
                    </button>
                </p>
                <p class="row">
                    <span class="col-sm-6">
                        Skip webhook:
                        <span class="text-danger me-2">{{ contest.skipWebhook ? 'true' : 'false' }}</span>
                    </span>
                    <button class="btn btn-sm btn-outline-info ms-3 w-25" @click="toggleSkipWebhook($event)">
                        Toggle
                    </button>
                </p>
                <hr />
                <p class="row">
                    <span class="col-sm-6">
                        Publicly visible:
                        <span class="text-danger me-2">{{ contest.isApproved ? 'true' : 'false' }}</span>
                    </span>
                    <button class="btn btn-sm btn-outline-info ms-3 w-25" @click="toggleIsApproved($event)">
                        Toggle
                    </button>
                </p>
            </div>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import ModalDialog from '@components/ModalDialog.vue';
import { defineComponent } from 'vue';
import { Contest } from '../../../interfaces/contest/contest';

export default defineComponent({
    name: 'ContestInfo',
    components: {
        ModalDialog,
    },
    props: {
        contest: {
            type: Object as () => Contest,
            default: null,
        },
    },
    methods: {
        async toggleIsApproved(e): Promise<void> {
            const res: any = await this.$http.executePost(
                `/admin/contests/${this.contest.id}/toggleIsApproved`,
                { isApproved: !this.contest.isApproved },
                e
            );

            if (res) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set isApproved to ${res.isApproved}`,
                    type: 'info',
                });
                this.$store.commit('updateIsApproved', {
                    contestId: this.contest.id,
                    isApproved: res.isApproved,
                });
            }
        },
        async toggleIsFeaturedArtistContest(e): Promise<void> {
            const res: any = await this.$http.executePost(
                `/admin/contests/${this.contest.id}/toggleIsFeaturedArtistContest`,
                { isFeaturedArtistContest: !this.contest.isFeaturedArtistContest },
                e
            );

            if (res) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set isFeaturedArtistContest to ${res.isFeaturedArtistContest}`,
                    type: 'info',
                });
                this.$store.commit('updateIsFeaturedArtistContest', {
                    contestId: this.contest.id,
                    isFeaturedArtistContest: res.isFeaturedArtistContest,
                });
            }
        },
        async toggleIsEligibleForPoints(e): Promise<void> {
            const res: any = await this.$http.executePost(
                `/admin/contests/${this.contest.id}/toggleIsEligibleForPoints`,
                { isEligibleForPoints: !this.contest.isEligibleForPoints },
                e
            );

            if (res) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set isEligibleForPoints to ${res.isEligibleForPoints}`,
                    type: 'info',
                });
                this.$store.commit('updateIsEligibleForPoints', {
                    contestId: this.contest.id,
                    isEligibleForPoints: res.isEligibleForPoints,
                });
            }
        },
        async toggleSkipWebhook(e): Promise<void> {
            const res: any = await this.$http.executePost(
                `/admin/contests/${this.contest.id}/toggleSkipWebhook`,
                { skipWebhook: !this.contest.skipWebhook },
                e
            );

            if (res) {
                this.$store.dispatch('updateToastMessages', {
                    message: `set skipWebhook to ${res.skipWebhook}`,
                    type: 'info',
                });
                this.$store.commit('updateSkipWebhook', {
                    contestId: this.contest.id,
                    skipWebhook: res.skipWebhook,
                });
            }
        },
    },
});
</script>