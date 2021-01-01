<template>
    <div>
        <beatmap-page-filters />

        <hosted-beatmaps />

        <div class="radial-divisor" />

        <guest-difficulties
            :is-loading-guest-beatmaps="isLoadingGuestBeatmaps"
        />

        <div class="radial-divisor" />

        <other-beatmaps />

        <!-- beatmap info modal -->
        <edit-beatmap-modal :selected-beatmap="selectedBeatmap" />

        <!-- create beatmap modal -->
        <create-beatmap-modal />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CreateBeatmapModal from '@components/beatmaps/CreateBeatmapModal.vue';
import BeatmapPageFilters from './BeatmapPageFilters.vue';
import HostedBeatmaps from './HostedBeatmaps.vue';
import GuestDifficulties from './GuestDifficulties.vue';
import OtherBeatmaps from './OtherBeatmaps.vue';
import EditBeatmapModal from './EditBeatmapModal.vue';
import beatmapsModule from '@store/beatmaps';
import { mapState } from 'vuex';

export default Vue.extend({
    name: 'BeatmapPage',
    components: {
        BeatmapPageFilters,
        HostedBeatmaps,
        GuestDifficulties,
        OtherBeatmaps,
        EditBeatmapModal,
        CreateBeatmapModal,
    },
    data() {
        return {
            isLoadingGuestBeatmaps: true,
        };
    },
    computed: mapState('beatmaps', [
        'selectedBeatmap',
    ]),
    beforeCreate () {
        if (!this.$store.hasModule('beatmaps')) {
            this.$store.registerModule('beatmaps', beatmapsModule);
        }
    },
    async created() {
        const id = this.$route.query.id;
        let data;
        let urlBeatmap;

        if (id) {
            [data, urlBeatmap] = await Promise.all<any, any>([
                this.initialRequest('/beatmaps/relevantInfo'),
                this.executeGet('/beatmaps/searchOnLoad/' + id),
            ]);

            if (!this.isError(urlBeatmap)) {
                this.$store.commit('beatmaps/setSelectedBeatmap', urlBeatmap);
                this.showModal('editBeatmap');
            }
        } else {
            data = await this.initialRequest('/beatmaps/relevantInfo');
        }

        if (!this.isError(data)) {
            this.$store.commit('beatmaps/setUserBeatmaps', data.beatmaps);
            this.$store.commit('beatmaps/setFilterMode', data.mainMode);
        }

        await Promise.all([
            this.loadGuestBeatmaps(),
            this.$store.dispatch('beatmaps/loadOtherBeatmaps'),
        ]);

        this.isLoadingGuestBeatmaps = false;
    },
    methods: {
        async loadGuestBeatmaps(): Promise<void> {
            const res: any = await this.executeGet('/beatmaps/guestBeatmaps');

            if (res) {
                this.$store.commit('beatmaps/setUserBeatmaps', res.userBeatmaps);
            }
        },
    },
});
</script>
