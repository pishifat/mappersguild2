<template>
    <div>
        <a
            v-for="i in 5"
            :key="i"
            class="mx-1"
            :class="{ 'disabled': usedVotes.includes(i) && savedVote != i }"
            :disabled="voteLoading"
            href="#"
            @click.prevent="updateVote(i)"
        >
            <i
                class="fa-star"
                :class="{'fas': usedVotes.includes(i) || savedVote == i, 'far': !usedVotes.includes(i) }"
            />
        </a>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import { ScreeningPlacement } from '@interfaces/contest/screening';

export default Vue.extend({
    name: 'ScreeningVote',
    props: {
        submissionId: {
            type: String,
            required: true,
        },
        savedVote: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        ...mapState({
            voteLoading: (state: any) => state.voteLoading,
        }),
        ...mapGetters(['usedVotes']),
    },
    methods: {
        async updateVote(vote): Promise<void> {
            this.$store.commit('setVoteLoading', true);

            if (this.savedVote == vote) {
                vote = ScreeningPlacement.None;
            }

            const submission = await this.executePost('/screening/updateSubmission/' + this.submissionId, { vote });

            if (!this.isError(submission)) {
                this.$store.commit('updateSubmission', submission);
            }

            this.$store.commit('setVoteLoading', false);
        },
    },
});
</script>
