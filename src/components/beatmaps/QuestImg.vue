<template>
    <img
        v-if="beatmap.quest || beatmap.mission || beatmap.isShowcase"
        v-bs-tooltip="(beatmap.quest && beatmap.quest.name) || (beatmap.mission && beatmap.mission.name) || 'FA showcase'"
        class="rounded-circle me-1 quest-icon"
        :src="url"
    />
</template>

<script lang="ts">
import { Beatmap } from '@interfaces/beatmap/beatmap';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    props: {
        beatmap: {
            type: Object as PropType<Beatmap>,
            required: true,
        },
    },
    computed: {
        url (): string {
            if (this.beatmap.mission) {
                switch (this.beatmap.mission.tier) {
                    case 1:
                        return '/images/bronze.png';
                    case 2:
                        return '/images/silver.png';
                    case 3:
                        return '/images/gold.png';
                    case 4:
                        return '/images/platinum.png';
                    default:
                        return '/images/bronze.png';
                }
            }

            if (this.beatmap.isShowcase || !this.beatmap.quest?.art) return '/images/no-art-icon.png';
            if (this.beatmap.quest.isMbc) return '/images/mbc-icon.png';

            return `https://assets.ppy.sh/artists/${this.beatmap.quest.art}/cover.jpg`;
        },
    },
});
</script>

<style scoped>

.quest-icon {
    width: 24px;
    height: 24px;
}

</style>
