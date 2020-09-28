<template>
    <div v-cloak>
        <div class="container bg-container py-3 mb-3">
            <button
                class="btn btn-block btn-outline-info"
                href="#"
                data-toggle="modal"
                data-target="#addBeatmap"
            >
                Add beatmap <i class="fas fa-plus small" />
            </button>
        </div>

        <showcase-beatmaps />

        <!-- beatmap info modal -->
        <edit-beatmap-modal />

        <!-- create beatmap modal -->
        <create-beatmap-modal :is-secret="true" />

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
import ShowcaseBeatmaps from '@pages/beatmaps/ShowcaseBeatmaps.vue';
import EditBeatmapModal from '@pages/beatmaps/EditBeatmapModal.vue';

export default Vue.extend({
    name: 'ShowcasePage',
    components: {
        ShowcaseBeatmaps,
        EditBeatmapModal,
        CreateBeatmapModal,
        NotificationsAccess,
        ToastMessages,
    },
    computed: mapState([
        'userGroup',
    ]),
    async created() {
        const params: any = new URLSearchParams(document.location.search.substring(1));

        if (params.get('id') && params.get('id').length) {
            const [res, urlBeatmap] = await Promise.all<any, any>([
                this.executeGet('/showcase/relevantInfo'),
                this.executeGet('/showcase/searchOnLoad/' + params.get('id')),
            ]);

            if (res) {
                this.$store.commit('setShowcaseBeatmaps', res.beatmaps);
                this.$store.commit('setUserOsuId', res.userOsuId);
                this.$store.commit('setUserId', res.userMongoId);
                this.$store.commit('setUsername', res.username);
                this.$store.commit('setUserGroup', res.group);
            }

            if (urlBeatmap && !urlBeatmap.error) {
                this.$store.commit('setSelectedBeatmap', urlBeatmap);
                $('#editBeatmap').modal('show');
            }
        } else {
            const res: any = await this.executeGet('/showcase/relevantInfo');

            if (res) {
                this.$store.commit('setShowcaseBeatmaps', res.beatmaps);
                this.$store.commit('setUserOsuId', res.userOsuId);
                this.$store.commit('setUserId', res.userMongoId);
                this.$store.commit('setUsername', res.username);
                this.$store.commit('setUserGroup', res.group);
            }
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
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
