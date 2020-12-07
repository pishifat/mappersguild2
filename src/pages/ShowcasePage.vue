<template>
    <div>
        <div class="container card card-body py-3 mb-3">
            <button
                class="btn btn-block btn-outline-info"
                href="#"
                data-toggle="modal"
                data-target="#addBeatmap"
            >
                Add beatmap <i class="fas fa-plus fa-xs" />
            </button>
        </div>

        <showcase-beatmaps />

        <!-- beatmap info modal -->
        <edit-beatmap-modal :selected-beatmap="selectedBeatmap" />

        <!-- create beatmap modal -->
        <create-beatmap-modal :is-secret="true" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import $ from 'jquery';
import CreateBeatmapModal from '@components/beatmaps/CreateBeatmapModal.vue';
import ShowcaseBeatmaps from '@pages/beatmaps/ShowcaseBeatmaps.vue';
import EditBeatmapModal from '@pages/beatmaps/EditBeatmapModal.vue';
import showcaseModule from '@store/showcase';
import { mapState } from 'vuex';

export default Vue.extend({
    name: 'ShowcasePage',
    components: {
        ShowcaseBeatmaps,
        EditBeatmapModal,
        CreateBeatmapModal,
    },
    computed: mapState({
        selectedBeatmap: (state: any) => state.showcase.selectedBeatmap,
    }),
    beforeCreate () {
        if (!this.$store.hasModule('showcase')) {
            this.$store.registerModule('showcase', showcaseModule);
        }
    },
    destroyed() {
        if (this.$store.hasModule('showcase')) {
            this.$store.unregisterModule('showcase');
        }
    },
    async created() {
        const params: any = new URLSearchParams(document.location.search.substring(1));

        if (params.get('id') && params.get('id').length) {
            const [res, urlBeatmap] = await Promise.all<any, any>([
                this.executeGet('/showcase/relevantInfo'),
                this.executeGet('/showcase/searchOnLoad/' + params.get('id')),
            ]);

            if (res) {
                this.$store.commit('showcase/setShowcaseBeatmaps', res.beatmaps);
            }

            if (urlBeatmap && !urlBeatmap.error) {
                this.$store.commit('showcase/setSelectedBeatmap', urlBeatmap);
                $('#editBeatmap').modal('show');
            }
        } else {
            const res: any = await this.executeGet('/showcase/relevantInfo');

            if (res) {
                this.$store.commit('showcase/setShowcaseBeatmaps', res.beatmaps);
            }
        }
    },
});
</script>
