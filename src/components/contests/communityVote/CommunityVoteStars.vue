<template>
    <div>
        <template v-if="orderedPriority">
            <a
                v-for="i in voteCount"
                :key="i"
                class="mx-1"
                :class="{ 'disabled-star': (usedVotes.includes(i) && savedVote != i) || voteLoading }"
                href="#"
                @click.prevent="updateVote(i)"
            >
                <i
                    class="fa-star fas"
                    :class="{ 'text-warning': savedVote == i }"
                />
            </a>
        </template>
        <template v-else>
            <a
                class="mx-1"
                :class="{ 'disabled-star': usedVotes.filter(v => v > 0).length >= voteCount && savedVote == 0 || voteLoading }"
                href="#"
                @click.prevent="updateVote(1)"
            >
                <i
                    class="fa-star fas"
                    :class="{ 'text-warning': savedVote > 0 }"
                />
            </a>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';

export default defineComponent({
    name: 'CommunityVoteStars',
    props: {
        submissionId: {
            type: String,
            required: true,
        },
        savedVote: {
            type: Number,
            default: 0,
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
        ...mapState({
            voteLoading: (state: any) => state.communityVote.voteLoading as boolean,
        }),
        ...mapGetters(['usedVotes']),
    },
    methods: {
        async updateVote(vote): Promise<void> {
            this.$store.commit('setVoteLoading', true);

            if (this.orderedPriority && this.savedVote == vote) {
                vote = 0;
            } else if (!this.orderedPriority && this.savedVote > 0) {
                vote = 0;
            }

            const submission = await this.$http.executePost('/contests/vote/updateVote/' + this.submissionId, { vote });

            if (!this.$http.isError(submission)) {
                this.$store.commit('updateSubmission', submission);
            }

            this.$store.commit('setVoteLoading', false);
        },
    },
});
</script>

<style scoped>
.disabled-star {
    pointer-events: none;
    color: gray;
}
</style>
