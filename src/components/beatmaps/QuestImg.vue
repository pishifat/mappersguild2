<template>
    <img
        v-if="beatmap.quest || beatmap.mission || beatmap.isShowcase"
        :key="$route.query.id?.toString()"
        v-bs-tooltip="(beatmap.quest && beatmap.quest.name) || (beatmap.mission && beatmap.mission.name) || 'FA showcase'"
        class="rounded-circle me-1"
        :class="bigIcon ? 'quest-icon-big' : 'quest-icon'"
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
        bigIcon: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        url (): string {
            if (this.beatmap.mission) {
                switch (this.beatmap.mission.tier) {
                    case 1:
                        return '/images/dark-bronze.png';
                    case 2:
                        return '/images/dark-silver.png';
                    case 3:
                        return '/images/dark-gold.png';
                    case 4:
                        return '/images/dark-platinum.png';
                    default:
                        return '/images/dark-bronze.png';
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

.quest-icon-big {
    top: calc(70% - 40px);
    left: -12px;
    width: 50px;
    height: 50px;
    max-width: 70px;
    max-height: 70px;
    object-fit: cover;
    border-radius: 100%;
    box-shadow: 0 1px 1rem rgba(10, 10, 25, .9);
    background-color: var(--gray-dark);
}
</style>
