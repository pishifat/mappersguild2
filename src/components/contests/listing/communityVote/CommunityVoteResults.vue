<template>
    <div>
        <div v-if="submissions.length" class="row">
            <div :class="communityVoteOrderedPriority ? 'col-sm-6' : 'col-sm-12'">
                <ul>
                    <li
                        v-for="submission in rawSortedSubmissions"
                        :key="submission.id + 'raw'"
                    >
                        <span class="text-guild">{{ rawVoteCount(submission) }}</span>
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
                        <span class="text-guild">{{ weightedScore(submission) }}</span>
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
            <span class="text-danger small">users whose votes are not counted because they voted more than {{ communityVoteCount }} times:</span>
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
import { defineComponent } from 'vue';
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
            submissions: [] as any[],
            communityVoteCount: 0,
            communityVoteOrderedPriority: false,
            badActors: [] as { id: string; osuId: number; username: string; count: number }[],
            loaded: false,
        };
    },
    computed: {
        rawSortedSubmissions(): any[] {
            return [...this.submissions].sort((a, b) => this.rawVoteCount(b) - this.rawVoteCount(a));
        },
        weightedSortedSubmissions(): any[] {
            return [...this.submissions].sort((a, b) => this.weightedScore(b) - this.weightedScore(a));
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
        rawVoteCount(submission: Submission): number {
            return (submission.communityVotes || []).filter(v => v.vote > 0).length;
        },
        weightedScore(submission: Submission): number {
            return (submission.communityVotes || []).reduce((acc, v) => acc + (v.vote > 0 ? this.communityVoteCount + 1 - v.vote : 0), 0);
        },
    },
});
</script>

<style scoped>
.text-guild {
    color: var(--guild);
}
</style>
