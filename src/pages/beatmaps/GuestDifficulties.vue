<template>
    <div class="container bg-container py-3">
        <h5 class="ml-2">
            <a href="#guestDifficultyBeatmaps" data-toggle="collapse">
                My guest difficulties ({{ guestDifficultyBeatmaps && !isLoadingGuestBeatmaps ? guestDifficultyBeatmaps.length : '...' }})
                <i class="fas fa-angle-down" />
            </a>
        </h5>

        <div
            v-if="guestDifficultyBeatmaps"
            id="guestDifficultyBeatmaps"
            class="collapse"
            :style="isLoadingGuestBeatmaps ? 'opacity: 0.3': ''"
        >
            <p v-if="!guestDifficultyBeatmaps.length && !isLoadingGuestBeatmaps" class="ml-5 text-white-50">
                None...
            </p>

            <transition-group name="list" tag="div" class="row">
                <beatmap-card
                    v-for="beatmap in guestDifficultyBeatmaps"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                />
            </transition-group>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import BeatmapCard from '../../components/beatmaps/BeatmapCard.vue';

export default Vue.extend({
    components: {
        BeatmapCard,
    },
    props: {
        isLoadingGuestBeatmaps: Boolean,
    },
    computed: {
        ...mapGetters([
            'guestDifficultyBeatmaps',
        ]),
        ...mapState([
            'userOsuId',
        ]),
    },
});
</script>