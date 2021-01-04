<template>
    <div>
        <div class="container card card-body py-3 mb-3">
            <button
                class="btn w-100 btn-outline-info"
                href="#"
                data-bs-toggle="modal"
                data-bs-target="#addBeatmap"
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
import { defineComponent } from 'vue';
import CreateBeatmapModal from '@components/beatmaps/CreateBeatmapModal.vue';
import ShowcaseBeatmaps from '@pages/beatmaps/ShowcaseBeatmaps.vue';
import EditBeatmapModal from '@pages/beatmaps/EditBeatmapModal.vue';
import beatmapsModule from '@store/beatmaps';
import { mapState } from 'vuex';

export default defineComponent({
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
        const id = this.$route.query.id;

        if (id) {
            const [res, urlBeatmap] = await Promise.all<any, any>([
                this.$http.initialRequest('/showcase/relevantInfo'),
                this.$http.executeGet('/showcase/searchOnLoad/' + id),
            ]);

            if (res) {
                this.$store.commit('beatmaps/setShowcaseBeatmaps', res.beatmaps);
            }

            if (urlBeatmap && !urlBeatmap.error) {
                this.$store.commit('beatmaps/setSelectedBeatmap', urlBeatmap);
                this.$bs.showModal('editBeatmap');
            }
        } else {
            const res: any = await this.$http.initialRequest('/showcase/relevantInfo');

            if (res) {
                this.$store.commit('beatmaps/setShowcaseBeatmaps', res.beatmaps);
            }
        }
    },
});
</script>
