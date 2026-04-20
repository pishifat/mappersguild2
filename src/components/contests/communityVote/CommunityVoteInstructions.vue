<template>
    <div class="mb-2">
        <a href="#communityVoteInstructions" data-bs-toggle="collapse" @click.prevent>
            How does voting work?
            <i class="fas fa-angle-down" />
        </a>
        <div id="communityVoteInstructions" class="collapse ms-4 mt-2 mb-2 small text-secondary">
            <ol v-if="selectedContest.communityVoteOrderedPriority">
                <li>You have <b>{{ selectedContest.communityVoteCount }} ranked votes</b> to assign across all submissions.</li>
                <li>Each star represents a rank: <b>1st</b> is your top pick and carries the most weight, down to <b>{{ rankLabel(selectedContest.communityVoteCount) }}</b>.</li>
                <li>Each rank can only be assigned to one submission. Clicking a star you've already used on another submission will not work.</li>
                <li>Click a star again to remove your vote from that submission.</li>
            </ol>
            <ol v-else>
                <li>You have <b>{{ selectedContest.communityVoteCount }} votes</b> to distribute across submissions.</li>
                <li>Click the star on a submission to vote for it. Click again to remove your vote.</li>
                <li>Once you've used all your votes, remaining submissions will be locked until you remove a vote.</li>
            </ol>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters } from 'vuex';

export default defineComponent({
    name: 'CommunityVoteInstructions',
    computed: {
        ...mapGetters([
            'selectedContest',
        ]),
    },
    methods: {
        rankLabel (n: number): string {
            if (n === 1) return '1st';
            if (n === 2) return '2nd';
            if (n === 3) return '3rd';

            return n + 'th';
        },
    },
});
</script>
