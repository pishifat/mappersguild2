<template>
    <div class="col-sm-12 my-1">
        <div
            class="card"
            :class="relatedVote && relatedVote.vote ? 'bg-vote' : 'bg-dark'"
        >
            <div class="card-body p-2">
                <div class="row">
                    <div class="col-sm-6">
                        {{ submission.name }}
                    </div>

                    <div class="col-sm-6 text-end">
                        <community-vote-stars
                            :submission-id="submission.id"
                            :saved-vote="relatedVote && relatedVote.vote || 0"
                            :vote-count="voteCount"
                            :ordered-priority="orderedPriority"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import CommunityVoteStars from '@components/contests/communityVote/CommunityVoteStars.vue';
import { Submission } from '@interfaces/contest/submission';
import { CommunityVote } from '@interfaces/contest/communityVote';

export default defineComponent({
    name: 'SubmissionCard',
    components: {
        CommunityVoteStars,
    },
    props: {
        submission: {
            type: Object as () => Submission,
            required: true,
        },
        voteCount: {
            type: Number,
            default: 5,
        },
        orderedPriority: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        relatedVote(): CommunityVote | undefined {
            return this.submission.communityVotes.find(v => v.voter._id === this.loggedInUser.id);
        },
    },
});
</script>

<style scoped>
.bg-vote {
    background-color: rgba(255, 255, 0, 0.075) !important;
}
</style>
