<template>
    <div class="container card card-body py-3">
        <h5 class="ms-2">
            <a href="#guestDifficultyBeatmaps" data-bs-toggle="collapse">
                My guest difficulties ({{ guestDifficultyBeatmaps && !isLoadingGuestBeatmaps ? guestDifficultyBeatmaps.length : '...' }})
                <i class="fas fa-angle-down" />
            </a>
        </h5>

        <div
            v-if="guestDifficultyBeatmaps"
            id="guestDifficultyBeatmaps"
            class="collapse"
            :class="{ 'loading-data' : isLoadingGuestBeatmaps }"
        >
            <p v-if="!guestDifficultyBeatmaps.length && !isLoadingGuestBeatmaps" class="ms-5 text-secondary">
                None...
            </p>

            <transition-group name="list" tag="div" class="row">
                <beatmap-card
                    v-for="beatmap in guestDifficultyBeatmaps"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    @update:selectedBeatmap="setSelectedBeatmap($event)"
                />
            </transition-group>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters, mapMutations } from 'vuex';
import BeatmapCard from '../../components/beatmaps/BeatmapCard.vue';

export default defineComponent({
    components: {
        BeatmapCard,
    },
    props: {
        isLoadingGuestBeatmaps: Boolean,
    },
    computed: mapGetters('beatmaps', [
        'guestDifficultyBeatmaps',
    ]),
    methods: mapMutations('beatmaps', [
        'setSelectedBeatmap',
    ]),
});
</script>