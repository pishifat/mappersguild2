<template>
    <div class="copy-paste small text-white-50 text-monospace">
        <div>
            | Rank | Beatmap | Judging | Musical representation ({{ judgeCount*10 }}) | Creativity ({{ judgeCount*10 }}) | Gameplay ({{ judgeCount*10 }}) | Limitation ({{ judgeCount*5 }}) | Raw total | Standardized total |
        </div>
        <div>
            | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
        </div>
        <div v-for="(usersScore, i) in usersScores" :key="usersScore.id">
            | \#{{ i+1 }}
            | [TITLE](LINK) by [{{ usersScore.creator.username }}](https://osu.ppy.sh/users/{{ usersScore.creator.osuId }})
            | [see details](https://mappersguild.com/contestresults?submission={{ getSubmissionIdByCreatorId(usersScore.creator.id) }})
            | {{ getCriteriaSumbyName('musical representation', usersScore.criteriaSum) }}
            | {{ getCriteriaSumbyName('creativity', usersScore.criteriaSum) }}
            | {{ getCriteriaSumbyName('gameplay', usersScore.criteriaSum) }}
            | {{ getCriteriaSumbyName('limitation', usersScore.criteriaSum) }}
            | **{{ usersScore.rawFinalScore }}**
            | **{{ Math.round(usersScore.standardizedFinalScore *100) / 100 }}**
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Contest } from '../../../../interfaces/contest/contest';
import { CriteriaName } from '../../../../interfaces/contest/criteria';

export default Vue.extend({
    name: 'MarkdownJudgingLeaderboard',
    props: {
        usersScores: {
            type: Array,
            required: true,
        },
        contest: {
            type: Object as () => Contest,
            required: true,
        },
        judgeCount: {
            type: Number,
            required: true,
        },
    },
    methods: {
        getSubmissionIdByCreatorId (creatorId: string): string {
            const submission = this.contest?.submissions.find(s => s.creator.id === creatorId);

            return submission!.id;
        },

        getCriteriaSumbyName (name: CriteriaName, criteriaSum): number {
            const cSum = criteriaSum.find(c => c.name === name);

            return cSum.sum;
        },
    },
});
</script>
