<template>
    <div class="container card card-body py-3 mb-2">
        <a href="#missionInformation" data-bs-toggle="collapse" @click.prevent>
            How do priority quests work?
            <i class="fas fa-angle-down" />
        </a>
        <div id="missionInformation" class="collapse ms-4 mb-2">
            <div class="small text-secondary">
                Priority quests differ from <a href="/quests">normal quests</a> in a few ways:
                <ol>
                    <li><b>You don't need to claim a priority quest to participate.</b> You only need to make a map and add it to the quest!</li>
                    <li><b>Priority quests have user-specific requirements.</b> These generally aim to give newer mappers an opportunity to get involved, like only allowing users without ranked maps to participate.</li>
                    <li><b>Multiple users can complete the same quest.</b> This depends on the quest's win condition, which varies per quest.</li>
                </ol>
                Here's a breakdown of this example priority quest:
            </div>
            <example-mission
                :mission="exampleMission"
            />
        </div>
        <a href="#missionRewards" data-bs-toggle="collapse" @click.prevent>
            What are the rewards for completing a priority quest?
            <i class="fas fa-angle-down" />
        </a>
        <div id="missionRewards" class="collapse ms-4 mb-2 small text-secondary">
            The host of a winning beatmap for a priority quest earns:
            <ul>
                <li><b>Progress towards a profile badge specific to priority quests.</b> You'll need to host 3 winning beatmapsets to earn the badge!</li>
                <li><b>Custom physical prize.</b> This is designed around your beatmap and varies depending on the tier of the quest</li>
            </ul>
            All user involved in a winning beatmap for a priority quest earn:
            <ul>
                <li><b>+3 bonus points per difficulty on a ranked beatmap.</b> This scales with length, so longer maps earn more points</li>
                <li><b>Variable points for completing a priority quest</b> This depends on the quest's difficulty tier:</li>
                <ul>
                    <li>
                        <img
                            class="tier-example me-1"
                            :src="'/images/bronze.png'"
                        />
                        5 points
                    </li>
                    <li>
                        <img
                            class="tier-example me-1"
                            :src="'/images/silver.png'"
                        />
                        8 points
                    </li>
                    <li>
                        <img
                            class="tier-example me-1"
                            :src="'/images/gold.png'"
                        />
                        15 points
                    </li>
                    <li>
                        <img
                            class="tier-example me-1"
                            :src="'/images/platinum.png'"
                        />
                        24 points
                    </li>
                </ul>
            </ul>
            Anyone who participates in a map for a priority quest and doesn't win earns:
            <ul>
                <li><b>+1 bonus point per difficulty (also scaling with length) on a ranked beatmap</b></li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import ExampleMission from '@components/missions/ExampleMission.vue';

export default defineComponent({
    name: 'MissionInformation',
    components: {
        ExampleMission,
    },
    computed: {
        ...mapState('missions', [
            'exampleMission',
        ]),
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