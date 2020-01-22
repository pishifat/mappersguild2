<template>
    <div v-cloak>
        <beatmap-page-filters @load-beatmaps="loadBeatmaps()" />

        <hosted-beatmaps />

        <div class="radial-divisor mx-auto my-4" />

        <guest-difficulties
            @update:fetch-limit="fetchLimit += 30"
            @load-beatmaps="loadBeatmaps($event)"
        />

        <div class="radial-divisor mx-auto my-4" />

        <other-beatmaps />

        <!-- beatmap info modal -->
        <edit-beatmap />

        <!-- create beatmap modal -->
        <create-beatmap />

        <notifications-access v-if="userGroup != 'spectator'" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import Axios from 'axios';
import $ from 'jquery';
import CreateBeatmap from '@components/beatmaps/CreateBeatmap.vue';
import NotificationsAccess from '@components/NotificationsAccess.vue';
import BeatmapPageFilters from './BeatmapPageFilters.vue';
import HostedBeatmaps from './HostedBeatmaps.vue';
import GuestDifficulties from './GuestDifficulties.vue';
import OtherBeatmaps from './OtherBeatmaps.vue';
import EditBeatmap from './EditBeatmap.vue';
import { Quest } from '@srcModels/quest';

export default Vue.extend({
    name: 'BeatmapPage',
    components: {
        BeatmapPageFilters,
        HostedBeatmaps,
        GuestDifficulties,
        OtherBeatmaps,
        EditBeatmap,
        CreateBeatmap,
        NotificationsAccess,
    },
    data() {
        return {
            info: null as null | string,
            isLoading: false,
            firstLoadingComplete: false,
            fetchLimit: 30,
            allQuests: [] as Quest[],
        };
    },
    computed: mapState([
        'userGroup',
        'filterMode',
        'filterStatus',
        'filterQuest',
        'filterValue',
    ]),
    created() {
        Axios
            .get('/beatmaps/relevantInfo')
            .then(response => {
                this.$store.commit('setUserBeatmaps', response.data.beatmaps);
                this.$store.commit('setUserOsuId', response.data.userOsuId);
                this.$store.commit('setUserId', response.data.userMongoId);
                this.$store.commit('setUsername', response.data.username);
                this.$store.commit('setUserGroup', response.data.group);
                this.$store.commit('setFilterMode', response.data.mainMode);
            })
            .then(() => {
                $('#loading').fadeOut();
                $('#app')
                    .attr('style', 'visibility: visible')
                    .hide()
                    .fadeIn();
            })
            .then(() => {
                this.loadBeatmaps();
            });
    },
    methods: {
        async loadBeatmaps(e?): Promise<void> {
            if (e) e.target.disabled = true;

            let mode = this.filterMode;
            this.isLoading = true;

            if (!this.filterMode.length) mode = 'any';

            const status = this.filterStatus ? `&status=${this.filterStatus}` : '';
            const quest = this.filterQuest ? `&quest=${this.filterQuest}` : '';
            const search = this.filterValue ? `&search=${this.filterValue}` : '';

            const response = await Axios.get(`/beatmaps/loadBeatmaps?mode=${mode}&limit=${this.fetchLimit + status + quest + search}`);
            this.$store.commit('setAllBeatmaps', response.data.allBeatmaps);
            this.$store.commit('setUserBeatmaps', response.data.userBeatmaps);

            this.isLoading = false;
            this.firstLoadingComplete = true;

            if (e) e.target.disabled = false;
        },
        updateBeatmap(bm): void {
            this.$store.dispatch('updateBeatmap', bm);
            this.info = '';
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
