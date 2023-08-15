<template>
    <div>
    <mission-card
        v-if="mission"
        :key="mission.id"
        :mission="mission"
        class="pe-none"
    />
    <div v-if="mission" class="text-secondary small">
        <ul>
            <li><b>Priority quest name:</b> {{ mission.name }}</li>
            <li><b>Priority quest tier:</b> Difficulty of the quest</li>
            <ul>
                <li
                    v-for="(url, i) in imageUrls"
                    :key="url">
                    <img
                        class="tier-example"
                        :src="url"
                    />
                    {{ i == 0 ? '(easiest, most common)' : i == 3 ? '(hardest, most rare)' : ''}}
            </li>
            </ul>
            <li><b>Priority quest modes:</b> {{ cleanModes.join(', ') }} {{ mission.modes.length == 4 ? `(if unlabeled, any mode is acceptable)` : ''}}</li>
            <li><b>Priority quest objective:</b> What you'll need to create to participate in the quest.</li>
            <li><b>Priority quest completion condition:</b> How to complete the quest.</li>
            <li><b>Deadline:</b> When beatmaps cannot be linked to the quest anymore.</li>
            <li><b>Applicable Featured Artists:</b> Artists whose songs are allowed in the quest.</li>
            <li><b>Associated maps:</b> Maps linked to the quest.</li>
        </ul>
    </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MissionCard from '@components/missions/MissionCard.vue';
import { Mission, MissionMode } from '@interfaces/mission';

export default defineComponent({
    name: 'ExampleMission',
    components: {
        MissionCard,
    },
    props: {
        mission: {
            type: Object as () => Mission,
            required: true,
        },
    },
    data () {
        return {
            imageUrls: ['/images/bronze.png', '/images/silver.png', '/images/gold.png', '/images/platinum.png'],
        };
    },
    computed: {
        cleanModes(): string[] {
            const cleanModes: string[] = [];

            for (const mode of this.mission.modes) {
                switch (mode) {
                    case MissionMode.Osu:
                        cleanModes.push('osu!');
                        break;
                    case MissionMode.Taiko:
                        cleanModes.push('osu!taiko');
                        break;
                    case MissionMode.Catch:
                        cleanModes.push('osu!catch');
                        break;
                    case MissionMode.Mania:
                        cleanModes.push('osu!mania');
                        break;
                    default:
                        break;
                }
            }

            return cleanModes;
        },
    },
});
</script>

<style scoped>
.tier-example {
    max-width: 15px;
    max-height: 15px;
    object-fit: cover;
}
</style>