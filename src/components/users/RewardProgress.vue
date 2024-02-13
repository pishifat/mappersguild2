<template>
    <div class="d-flex mb-2">
        <img
            v-if="selectedUser.rank > 0"
            :key="$route.query.id"
            v-bs-tooltip="`${selectedUser.username}'s current MG rank`"
            :src="`/images/rank${selectedUser.rank}.png`"
            class="osu-badge badge-small"
        />
        <img
            v-if="selectedUser.rank < 4"
            :key="$route.query.id"
            v-bs-tooltip="`${selectedUser.username}'s next MG rank`"
            :src="`/images/rank${selectedUser.rank+1}.png`"
            class="osu-badge badge-small ms-auto"
        />
    </div>
    <div class="progress-bar osu-badge">
        <reward-progress-segment
            :points="selectedUser.easyPoints"
            :bg-class="'bg-easy'"
            :tooltip-text="'mapping Easy difficulties'"
            :display-text="'Easy'"
        />
        <reward-progress-segment
            :points="selectedUser.normalPoints"
            :bg-class="'bg-normal'"
            :tooltip-text="'mapping Normal difficulties'"
            :display-text="'Normal'"
        />
        <reward-progress-segment
            :points="selectedUser.hardPoints"
            :bg-class="'bg-hard'"
            :tooltip-text="'mapping Hard difficulties'"
            :display-text="'Hard'"
        />
        <reward-progress-segment
            :points="selectedUser.insanePoints"
            :bg-class="'bg-insane'"
            :tooltip-text="'mapping Insane difficulties'"
            :display-text="'Insane'"
        />
        <reward-progress-segment
            :points="selectedUser.expertPoints"
            :bg-class="'bg-expert'"
            :tooltip-text="'mapping Expert difficulties'"
            :display-text="'Expert'"
        />
        <reward-progress-segment
            :points="selectedUser.hitsoundPoints"
            :bg-class="'bg-rank-0'"
            :tooltip-text="'Hitsounding'"
            :display-text="'HS'"
        />
        <reward-progress-segment
            :points="selectedUser.storyboardPoints"
            :bg-class="'bg-rank-4'"
            :tooltip-text="'Storyboarding'"
            :display-text="'SB'"
        />
        <reward-progress-segment
            :points="selectedUser.questPoints"
            :bg-class="'bg-wip'"
            :tooltip-text="'Completing quests'"
            :display-text="'Quests'"
        />
        <reward-progress-segment
            :points="selectedUser.missionPoints"
            :bg-class="'bg-qualified'"
            :tooltip-text="'Completing priority quests'"
            :display-text="'Priority quests'"
        />
        <reward-progress-segment
            :points="selectedUser.modPoints"
            :bg-class="'bg-done'"
            :tooltip-text="'Modding'"
            :display-text="'Mods'"
        />
        <reward-progress-segment
            :points="selectedUser.hostPoints"
            :bg-class="'bg-ranked'"
            :tooltip-text="'Hosting mapsets'"
            :display-text="'Host'"
        />
        <reward-progress-segment
            :points="selectedUser.contestCreatorPoints + selectedUser.contestParticipantPoints + selectedUser.contestScreenerPoints + selectedUser.contestJudgePoints"
            :bg-class="'bg-open'"
            :tooltip-text="'Anything related to FA mapping contests '"
            :display-text="'Contests'"
        />
        <reward-progress-segment
            :points="selectedUser.legacyPoints"
            :bg-class="'bg-blocked'"
            :tooltip-text="'Legacy'"
            :display-text="'Legacy'"
        />
        <reward-progress-segment
            :points="maxPoints - selectedUser.totalPoints"
            :bg-class="'bg-black'"
            :tooltip-text="'Points until next badge'"
            :display-text="'...'"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters } from 'vuex';
import RewardProgressSegment from './RewardProgressSegment.vue';

export default defineComponent({
    name: 'RewardProgress',
    components: {
        RewardProgressSegment,
    },
    computed: {
        ...mapGetters('users', [
            'selectedUser',
        ]),
        maxPoints () {
            let maxPoints;

            switch (this.selectedUser.rank) {
                case 0:
                    maxPoints = 100;
                    break;
                case 1:
                    maxPoints = 250;
                    break;
                case 2:
                    maxPoints = 500;
                    break;
                case 3:
                    maxPoints = 1000;
                    break;
                case 4:
                    maxPoints = this.selectedUser.totalPoints;
                    break;
            }

            return maxPoints;
        },
    },
});
</script>

<style scoped>
.badge-small {
    width: 100px;
}
.progress-bar {
    display: block;
    width: 100%;
    height: 30px;
    background-color: black;
}

.segment {
    display: inline-block;
    height: 100%;
    min-width: 0;
}
.segment-text {
    display: flex;
    white-space: nowrap;
    overflow: hidden;
    font-size: 12px;
    transform: translateY(10%);
    color: black;
    margin: 4px;
}
</style>