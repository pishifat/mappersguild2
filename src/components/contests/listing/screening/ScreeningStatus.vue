<template>
    <div>
        <table
            class="table table-sm table-responsive-lg small"
        >
            <thead>
                <tr>
                    <th>Screener</th>
                    <th>Count</th>
                    <th>Unused ratings</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="screener in contest.screeners"
                    :key="screener.id"
                >
                    <td>
                        <user-link :user="screener" />
                    </td>
                    <td :class="findScreenerDetails(screener).count == contest.screeningVoteCount ? 'text-success' : 'text-danger'">
                        {{ findScreenerDetails(screener).count }}/{{ contest.screeningVoteCount }}
                    </td>
                    <td>
                        <span v-for="unusedVote in findScreenerDetails(screener).unusedVotes" :key="unusedVote">
                            <span class="mx-1">
                                <i
                                    v-for="i in unusedVote"
                                    :key="i"
                                    class="fa-star fas text-warning small"
                                /> ({{ unusedVote }})
                            </span>
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Contest } from '@interfaces/contest/contest';
import { User } from '@interfaces/user';
import { ScreeningPlacement } from '@interfaces/contest/screening';

export default defineComponent({
    name: 'ScreeningStatus',
    props: {
        contest: {
            type: Object as PropType<Contest>,
            required: true,
        },
    },
    methods: {
        findScreenerDetails (user: User): any {
            let count = 0;
            let usedVotes: ScreeningPlacement[] = [];

            for (const submission of this.contest.submissions) {
                for (const screening of submission.screenings) {
                    if (screening.screener.id == user.id && screening.vote) {
                        count++;
                        usedVotes.push(screening.vote);
                    }
                }
            }

            const unusedVotes: ScreeningPlacement[] = [];
            const possibleVotes: ScreeningPlacement[] = [];

            for (let i = 0; i < this.contest.screeningVoteCount; i++) {
                possibleVotes.push(i+1);
            }

            for (const vote of possibleVotes) {
                if (!usedVotes.includes(vote)) {
                    unusedVotes.push(vote);
                }
            }

            return { count, unusedVotes };
        },
    },
});
</script>