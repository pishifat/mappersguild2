<template>
    <div class="container bg-container py-3">
        <h5 class="ml-2">
            <a href="#hostedBeatmaps" data-toggle="collapse">
                My mapsets ({{ hostedBeatmaps ? hostedBeatmaps.length : '...' }})
                <i class="fas fa-angle-down" />
            </a>
            <span v-if="isLoading" class="text-white-50" style="font-size: 9pt;">loading...</span>
        </h5>

        <div v-if="hostedBeatmaps" id="hostedBeatmaps" class="show">
            <transition-group name="list" tag="div" class="row">
                <beatmap-card
                    v-for="beatmap in hostedBeatmaps"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                />
            </transition-group>
            <p v-if="!hostedBeatmaps.length" class="ml-5 text-white-50">
                None...
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import BeatmapCard from '../../components/beatmaps/BeatmapCard.vue';

export default Vue.extend({
    components: {
        BeatmapCard,
    },
    data () {
        return {
            isLoading: false,
        };
    },
    computed: mapGetters([
        'hostedBeatmaps',
    ]),
});
</script>