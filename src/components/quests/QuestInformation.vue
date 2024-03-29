<template>
    <div class="container card card-body py-3 mb-2">
        <a href="#questInformation" data-bs-toggle="collapse" @click.prevent>
            How do quests work?
            <i class="fas fa-angle-down" />
        </a>
        <div id="questInformation" class="collapse ms-4">
            <div class="small text-secondary">
                Quests reward mappers for following certain requirements when creating their Featured Artist maps. Most quests involve creating and ranking a certain number of beatmaps for a specific Featured Artist, and new quests are added weekly.
            </div>
            <hr />
            <div class="small text-secondary mt-2">
                To begin a quest, a party must claim it. Only one party can run a quest per mode.
            </div>
            <div class="small text-secondary mt-2">
                If a quest is not claimed within 90 days, it expires. To re-open an expired quest, a user must spend some of their available points.
            </div>
            <div class="small text-secondary mt-2">
                Here's a breakdown of this example quest:
            </div>
            <example-quest
                :quest="exampleQuest"
            />
        </div>
        <a href="#questRewards" data-bs-toggle="collapse" @click.prevent>
            What are the rewards for completing a quest?
            <i class="fas fa-angle-down" />
        </a>
        <div id="questRewards" class="collapse ms-4 small text-secondary">
            <ul>
                <li><b>7 points</b> if a quest is completed on time.</li>
                <li><b>+2 bonus points per difficulty on a ranked beatmap.</b> This scales with length, so longer maps earn more points.</li>
                <li>If a beatmap is ranked after the quest's deadline, bonus points are adjusted as follows:</li>
                <ul>
                    <li>1.5 points for 0-20 days late</li>
                    <li>1 point for 21-40 days late</li>
                    <li>0.5 points for 40+ days late</li>
                </ul>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import ExampleQuest from '@components/quests/ExampleQuest.vue';

export default defineComponent({
    name: 'QuestInformation',
    components: {
        ExampleQuest,
    },
    computed: {
        ...mapState('quests', [
            'exampleQuest',
        ]),
    },
});
</script>
