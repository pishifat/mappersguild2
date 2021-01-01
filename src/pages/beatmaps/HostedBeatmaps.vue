<template>
    <div class="container card card-body py-3">
        <h5 class="ms-2">
            <a href="#hostedBeatmaps" data-bs-toggle="collapse">
                My mapsets ({{ hostedBeatmaps ? hostedBeatmaps.length : '...' }})
                <i class="fas fa-angle-down" />
            </a>
        </h5>

        <div v-if="hostedBeatmaps" id="hostedBeatmaps" class="show">
            <transition-group name="list" tag="div" class="row">
                <beatmap-card
                    v-for="beatmap in hostedBeatmaps"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    @set-selected-beatmap="setSelectedBeatmap($event)"
                />
            </transition-group>
            <p v-if="!hostedBeatmaps.length" class="ms-5 text-white-50">
                None...
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';
import BeatmapCard from '@components/beatmaps/BeatmapCard.vue';

export default Vue.extend({
    components: {
        BeatmapCard,
    },
    computed: mapGetters('beatmaps', [
        'hostedBeatmaps',
    ]),
    methods: mapMutations('beatmaps', [
        'setSelectedBeatmap',
    ]),
});
</script>