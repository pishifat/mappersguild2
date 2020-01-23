<template>
    <div v-cloak>
        <beatmap-page-filters @load-beatmaps="loadBeatmaps()" />

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
import Axios from 'axios';
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
        const res = await Axios.get('/beatmaps/relevantInfo');

        if (res.data) {
            this.$store.commit('setUserBeatmaps', res.data.beatmaps);
            this.$store.commit('setUserOsuId', res.data.userOsuId);
            this.$store.commit('setUserId', res.data.userMongoId);
            this.$store.commit('setUsername', res.data.username);
            this.$store.commit('setUserGroup', res.data.group);
            this.$store.commit('setFilterMode', res.data.mainMode);
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();

        await Promise.all([
            this.loadGuestBeatmaps(),
            this.$store.dispatch('loadOthersBeatmaps'),
        ]);

        this.isLoadingGuestBeatmaps = false;
    },
    methods: {
        async loadGuestBeatmaps(): Promise<void> {
            const res = await Axios.get('/beatmaps/guestBeatmaps');

            if (res?.data?.userBeatmaps) {
                this.$store.commit('setUserBeatmaps', res.data.userBeatmaps);
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
