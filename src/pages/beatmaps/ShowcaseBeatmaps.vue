<template>
    <div class="container card card-body py-3">
        <h5 class="ms-2">
            <a href="#showcaseBeatmaps" data-bs-toggle="collapse">
                Showcase mapsets ({{ showcaseBeatmaps ? showcaseBeatmaps.length : '...' }})
                <i class="fas fa-angle-down" />
            </a>
        </h5>

        <div v-if="showcaseBeatmaps" id="showcaseBeatmaps" class="show">
            <transition-group name="list" tag="div" class="row">
                <beatmap-card
                    v-for="beatmap in showcaseBeatmaps"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    @update:selectedBeatmap="setSelectedBeatmap($event)"
                />
            </transition-group>
            <p v-if="!showcaseBeatmaps.length" class="ms-5 text-white-50">
                None...
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapMutations, mapState } from 'vuex';
import BeatmapCard from '../../components/beatmaps/BeatmapCard.vue';

export default defineComponent({
    components: {
        BeatmapCard,
    },
    computed: mapState('beatmaps', [
        'showcaseBeatmaps',
    ]),
    methods: mapMutations('beatmaps', [
        'setSelectedBeatmap',
    ]),
});
</script>