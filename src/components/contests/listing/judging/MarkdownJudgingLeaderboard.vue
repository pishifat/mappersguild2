<template>
    <copy-paste class="tiny">
        <div>
            | Rank | Beatmap | Judging | Musical representation ({{ judgeCount*10 }}) | Creativity ({{ judgeCount*10 }}) | Gameplay ({{ judgeCount*10 }}) | Limitation ({{ judgeCount*5 }}) | Total (standardized/raw) |
        </div>
        <div>
            | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
        </div>
        <div v-for="(usersScore, i) in usersScores" :key="i">
            | \#{{ i+1 }}
            | [TITLE](LINK) by [{{ usersScore.creator.username }}](https://osu.ppy.sh/users/{{ usersScore.creator.osuId }})
            | [details](https://mappersguild.com/contests/results?submission={{ getSubmissionIdByCreatorId(usersScore.creator.id) }})
            <span v-for="criteria in scoredCriteria" :key="criteria.id">| {{ getCriteriaSumbyName(criteria.name, usersScore.criteriaSum) + ' ' }}</span>
            | **{{ Math.round(usersScore.standardizedFinalScore *100) / 100 }}** ({{ usersScore.rawFinalScore }}) |
        </div>
    </copy-paste>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { UserScore } from '@interfaces/contest/judging';
import { Contest } from '@interfaces/contest/contest';
import { Criteria } from '@interfaces/contest/criteria';
import CopyPaste from '../../../CopyPaste.vue';

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
    computed: {
        scoredCriteria (): Criteria[] {
            return this.contest.criterias.filter(c => c.name !== 'comments');
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

<style scoped>
.tiny {
    font-size: 6pt;
}
</style>
