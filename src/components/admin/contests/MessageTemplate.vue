<template>
    <div>
        <a :href="'https://osu.ppy.sh/forum/ucp.php?i=pm&mode=compose&u=' + osuId" target="_blank">
            <button class="btn btn-sm btn-outline-info">
                Open osu! PM
            </button>
        </a>
        <div class="copy-paste small text-white-50">
            <samp>hello, you're getting this message because you submitted an entry for last month's monthly beatmapping contest!</samp><br><br>
            <samp>your submission was {{ voteCount >= 13 ? '' : 'not' }} a finalist for voting with {{ totalVotes }} {{ totalVotes == 1 ? 'placement' : 'placements' }} in the screening crew members's top 5 maps (screening crew = mappers who narrowed down the finalists)</samp><br><br>
            <samp>here are some comments the screening crew had on your submission. these are mostly their personal notes, so they're not intended to be constructive feedback. i manually removed extra rude comments (if they existed) and some users didn't leave comments on some submissions</samp><br><br>
            <samp>[notice]</samp>
            <span v-for="(evaluation, i) in evaluations" :key="evaluation.id">
                <samp>user {{ i + 1 }}: {{ evaluation.vote > 0 ? '(placed in top 5)' : '' }} </samp><br>
                <samp style="word-break: break-word;">
                    {{ evaluation.comment }}
                </samp><br><br>
            </span>
            <samp>[/notice]</samp><br><br>
            <samp>thanks for participating and i hope to see you in another mbc!!</samp>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Judging } from '../../../../interfaces/contest/judging';

export default Vue.extend({
    name: 'MessageTemplate',
    props: {
        evaluations: {
            type: Array as () => Judging[],
            required: true,
        },
        osuId: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        totalVotes(): number {
            let count = 0;
            this.evaluations.forEach(evaluation => {

                if (evaluation.vote) {
                    count++;
                }
            });

            return count;
        },
        voteCount(): number {
            let count = 0;
            this.evaluations.forEach(evaluation => {
                count += evaluation.vote;
            });

            return count;
        },
    },
});
</script>
