<template>
    <div>
        <div class="container card card-body py-3 mb-3">
            temp
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import beatmapsModule from '@store/beatmaps';
import { mapState } from 'vuex';

export default defineComponent({
    name: 'ShowcasePage',
    components: {
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
