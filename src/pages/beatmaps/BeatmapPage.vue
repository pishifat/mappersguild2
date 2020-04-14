<template>
    <div v-cloak>
        <beatmap-page-filters />

        <hosted-beatmaps />

        <div class="radial-divisor mx-auto my-4" />

        <guest-difficulties
            :is-loading-guest-beatmaps="isLoadingGuestBeatmaps"
        />

        <div class="radial-divisor mx-auto my-4" />

        <other-beatmaps />

        <!-- beatmap info modal -->
        <edit-beatmap-modal />

        <!-- create beatmap modal -->
        <create-beatmap-modal />

        <toast-messages />

        <notifications-access v-if="userGroup != 'spectator'" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import $ from 'jquery';
import CreateBeatmapModal from '@components/beatmaps/CreateBeatmapModal.vue';
import NotificationsAccess from '@components/NotificationsAccess.vue';
import ToastMessages from '@components/ToastMessages.vue';
import BeatmapPageFilters from './BeatmapPageFilters.vue';
import HostedBeatmaps from './HostedBeatmaps.vue';
import GuestDifficulties from './GuestDifficulties.vue';
import OtherBeatmaps from './OtherBeatmaps.vue';
import EditBeatmapModal from './EditBeatmapModal.vue';

export default Vue.extend({
    name: 'BeatmapPage',
    components: {
        BeatmapPageFilters,
        HostedBeatmaps,
        GuestDifficulties,
        OtherBeatmaps,
        EditBeatmapModal,
        CreateBeatmapModal,
        NotificationsAccess,
        ToastMessages,
    },
    data() {
        return {
            isLoadingGuestBeatmaps: true,
        };
    },
    computed: mapState([
        'userGroup',
    ]),
    async created() {
        const params: any = new URLSearchParams(document.location.search.substring(1));

        if (params.get('id') && params.get('id').length) {
            const [res, urlBeatmap] = await Promise.all<any, any>([
                this.executeGet('/beatmaps/relevantInfo'),
                this.executeGet('/beatmaps/searchOnLoad/' + params.get('id')),
            ]);

            if (res) {
                this.$store.commit('setUserBeatmaps', res.beatmaps);
                this.$store.commit('setUserOsuId', res.userOsuId);
                this.$store.commit('setUserId', res.userMongoId);
                this.$store.commit('setUsername', res.username);
                this.$store.commit('setUserGroup', res.group);
                this.$store.commit('setFilterMode', res.mainMode);
            }

            if (urlBeatmap && !urlBeatmap.error) {
                this.$store.commit('setSelectedBeatmapId', urlBeatmap.id);
                this.$store.commit('setSelectedBeatmap', urlBeatmap);
                $('#editBeatmap').modal('show');
            }
        } else {
            const res: any = await this.executeGet('/beatmaps/relevantInfo');

            if (res) {
                this.$store.commit('setUserBeatmaps', res.beatmaps);
                this.$store.commit('setUserOsuId', res.userOsuId);
                this.$store.commit('setUserId', res.userMongoId);
                this.$store.commit('setUsername', res.username);
                this.$store.commit('setUserGroup', res.group);
                this.$store.commit('setFilterMode', res.mainMode);
            }
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();

        await Promise.all([
            this.loadGuestBeatmaps(),
            this.$store.dispatch('loadOtherBeatmaps'),
        ]);

        this.isLoadingGuestBeatmaps = false;
    },
    methods: {
        async loadGuestBeatmaps(): Promise<void> {
            const res: any = await this.executeGet('/beatmaps/guestBeatmaps');

            if (res) {
                this.$store.commit('setUserBeatmaps', res.userBeatmaps);
            }
        },
    },
});
</script>

<style>
.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}
</style>
