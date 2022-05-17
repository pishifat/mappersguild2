<template>
    <copy-paste>
        <div>
            | Rank | Beatmap | Judging | Musical representation ({{ judgeCount*10 }}) | Creativity ({{ judgeCount*10 }}) | Gameplay ({{ judgeCount*10 }}) | Limitation ({{ judgeCount*5 }}) | Raw total | Standardized total |
        </div>
        <div>
            | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
        </div>
        <div v-for="(usersScore, i) in usersScores" :key="i">
            | \#{{ i+1 }}
            | [TITLE](LINK) by [{{ usersScore.creator.username }}](https://osu.ppy.sh/users/{{ usersScore.creator.osuId }})
            | [see details](https://mappersguild.com/contestresults?submission={{ getSubmissionIdByCreatorId(usersScore.creator.id) }})
            | {{ getCriteriaSumbyName('musical representation', usersScore.criteriaSum) }}
            | {{ getCriteriaSumbyName('creativity', usersScore.criteriaSum) }}
            | {{ getCriteriaSumbyName('gameplay', usersScore.criteriaSum) }}
            | {{ getCriteriaSumbyName('limitation', usersScore.criteriaSum) }}
            <!--| {{ getCriteriaSumbyName('theme', usersScore.criteriaSum) }} -->
            | **{{ usersScore.rawFinalScore }}**
            | **{{ Math.round(usersScore.standardizedFinalScore *100) / 100 }}**
        </div>
    </copy-paste>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { UserScore } from '@interfaces/contest/judging';
import { Contest } from '@interfaces/contest/contest';
import CopyPaste from '../../CopyPaste.vue';

export default defineComponent({
    name: 'MarkdownJudgingLeaderboard',
    components: {
        CopyPaste,
    },
    props: {
        usersScores: {
            type: Array as PropType<UserScore[]>,
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

        getCriteriaSumbyName (name: string, criteriaSum): number {
            const cSum = criteriaSum.find(c => c.name === name);

            return cSum?.sum || NaN;
        },
    },
});
</script>
