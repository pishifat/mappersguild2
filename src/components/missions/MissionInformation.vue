<template>
    <div class="container card card-body py-3 mb-2">
        <a href="#missionInformation" data-bs-toggle="collapse" @click.prevent>
            How do missions work?
            <i class="fas fa-angle-down" />
        </a>
        <div id="missionInformation" class="collapse ms-4 mb-2 small text-secondary">
            <div>
                Missions differ from quests in a few ways:
                <ol>
                    <li><b>You don't need to claim the mission to participate.</b></li>
                    <li><b>Missions have user-specific requirements.</b> For example, some missions are only available to users who have no ranked maps.</li>
                    <li><b>Multiple users can complete the same mission.</b></li>
                </ol>
                // example mission goes here
            </div>
        </div>
        <a href="#missionRewards" data-bs-toggle="collapse" @click.prevent>
            What are the rewards for completing a mission?
            <i class="fas fa-angle-down" />
        </a>
        <div id="missionRewards" class="collapse ms-4 mb-2 small">
            <ul>
                <li>tiers have different rewards</li>
                <li>first mission completed in each tier: physical prize (show example)</li>
                <li>3 missions completed: profile badge</li>
                <li>most missions in the year: special prize tbd</li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'MissionInformation',
});
</script>
