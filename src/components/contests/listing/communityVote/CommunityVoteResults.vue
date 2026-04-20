<template>
    <div>
        <div v-if="submissions.length" class="row">
            <div :class="communityVoteOrderedPriority ? 'col-sm-6' : 'col-sm-12'">
                <ul>
                    <li
                        v-for="submission in rawSortedSubmissions"
                        :key="submission.id + 'raw'"
                    >
                        <span class="text-warning">{{ rawVoteCount(submission) }}</span>
                        <span class="text-secondary small ms-1">votes</span>
                        - {{ submission.name }} by <user-link :user="submission.creator" />
                    </li>
                </ul>
            </div>

            <div v-if="communityVoteOrderedPriority" class="col-sm-6">
                <ul>
                    <li
                        v-for="submission in weightedSortedSubmissions"
                        :key="submission.id + 'weighted'"
                    >
                        <span class="text-warning">{{ weightedScore(submission) }}</span>
                        <span class="text-secondary small ms-1">weighted votes</span>
                        - {{ submission.name }} by <user-link :user="submission.creator" />
                    </li>
                </ul>
            </div>
        </div>
        <div v-else-if="loaded" class="text-secondary small ms-2">
            No votes yet.
        </div>

        <div v-if="badActors.length" class="mt-2">
            <span class="text-danger small">Suspicious voters (voted more than {{ communityVoteCount }} times — votes not counted):</span>
            <ul>
                <li v-for="actor in badActors" :key="actor.id" class="small text-danger">
                    <a :href="`https://osu.ppy.sh/users/${actor.osuId}`" target="_blank">{{ actor.username }}</a>
                    ({{ actor.count }} votes)
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Submission } from '@interfaces/contest/submission';

export default defineComponent({
    name: 'CommunityVoteResults',
    props: {
        contestId: {
            type: String,
            required: true,
        },
    },
    data () {
        return {
            submissions: [] as Submission[],
            communityVoteCount: 0,
            communityVoteOrderedPriority: false,
            badActors: [] as { id: string; osuId: number; username: string; count: number }[],
            loaded: false,
        };
    },
    computed: {
        sortedSubmissions(): Submission[] {
            return [...this.submissions].sort((a, b) => this.submissionScore(b) - this.submissionScore(a));
        },
    },
    watch: {
        async contestId(): Promise<void> {
            await this.loadResults();
        },
    },
    async created () {
        await this.loadResults();
    },
    methods: {
        async loadResults(): Promise<void> {
            this.loaded = false;
            const data: any = await this.$http.executeGet(`/contests/listing/${this.contestId}/communityVoteResults`);

            if (!this.$http.isError(data)) {
                this.submissions = data.submissions;
                this.communityVoteCount = data.communityVoteCount;
                this.communityVoteOrderedPriority = data.communityVoteOrderedPriority;
                this.badActors = data.badActors || [];
            }

            this.loaded = true;
        },
        submissionScore(submission: Submission): number {
            return submission.communityVotes.reduce((acc, v) => acc + (v.vote || 0), 0);
        },
    },
});
</script>
