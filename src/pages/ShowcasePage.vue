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
import beatmapsModule from '@store/beatmaps';
import { mapState } from 'vuex';

export default Vue.extend({
    name: 'ShowcasePage',
    components: {
        ShowcaseBeatmaps,
        EditBeatmapModal,
        CreateBeatmapModal,
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
        const params: any = new URLSearchParams(document.location.search.substring(1));

        if (params.get('id') && params.get('id').length) {
            const [res, urlBeatmap] = await Promise.all<any, any>([
                this.initialRequest('/showcase/relevantInfo'),
                this.executeGet('/showcase/searchOnLoad/' + params.get('id')),
            ]);

            if (res) {
                this.$store.commit('beatmaps/setShowcaseBeatmaps', res.beatmaps);
            }

            if (urlBeatmap && !urlBeatmap.error) {
                this.$store.commit('beatmaps/setSelectedBeatmap', urlBeatmap);
                $('#editBeatmap').modal('show');
            }
        } else {
            const res: any = await this.initialRequest('/showcase/relevantInfo');

            if (res) {
                this.$store.commit('beatmaps/setShowcaseBeatmaps', res.beatmaps);
            }
        }
    },
});
</script>
