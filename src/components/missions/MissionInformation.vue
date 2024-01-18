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
                    <li><b>You don't need to claim a priority quest to participate.</b> You only need to make a map and connect it to the quest!</li>
                    <li><b>Some priority quests have user-specific requirements.</b> These generally aim to give newer mappers an opportunity to get involved, like only allowing users without ranked maps to participate.</li>
                    <li><b>Multiple users can complete the same quest.</b> This depends on the quest's win condition.</li>
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
            <b>The host</b> of a beatmap that completes a priority quest earns:
            <ul>
                <li><b>Progress towards a profile badge specific to priority quests.</b> You'll need to host 3 beatmapsets that complete priority quests to earn the badge!</li>
                <img
                    class="ms-2 text-center rounded"
                    :src="'/images/questbadge.png'"
                />
                <li><b>Customized mapping keychain for each priority quest completed:</b></li>
                <div class="row">
                    <div class="col-sm-4">
                        <img
                            class="text-center w-100 ms-2 rounded"
                            :src="'/images/examplemap.png'"
                        />
                        <ul>
                            <li>
                                Front: Pattern from your beatmap.
                            </li>
                            <li>
                                Back: Your username and Mappers' Guild logos.
                            </li>
                            <li>
                                Depending on your country, shipping may be difficult (or even impossible). These are being made and shipped individually by pishifat, so don't expect the efficiency of a professional company!
                            </li>
                        </ul>
                    </div>
                    <div class="col-sm-6">
                        <img
                            class="ms-2 text-center w-100 rounded"
                            :src="'/images/keychain.jpg'"
                        />
                    </div>
                </div>
            </ul>
            <b>All users</b> involved in a beatmap that completes a priority quest earn:
            <ul>
                <li><b>+2 bonus points per difficulty on a ranked beatmap.</b> This scales with length, so longer maps earn more points</li>
                <li><b>Variable points for completing a priority quest.</b> This depends on the quest's difficulty tier:</li>
                <ul>
                    <li>
                        <img
                            class="tier-example me-1"
                            :src="'/images/bronze.png'"
                        />
                        <b>Tier 1:</b> 7 points
                    </li>
                    <li>
                        <img
                            class="tier-example me-1"
                            :src="'/images/silver.png'"
                        />
                        <b>Tier 2:</b> 10 points
                    </li>
                    <li>
                        <img
                            class="tier-example me-1"
                            :src="'/images/gold.png'"
                        />
                        <b>Tier 3:</b> 13 points
                    </li>
                    <li>
                        <img
                            class="tier-example me-1"
                            :src="'/images/platinum.png'"
                        />
                        <b>Tier 4:</b> 20 points
                    </li>
                </ul>
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