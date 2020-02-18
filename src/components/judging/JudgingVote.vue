<template>
    <div>
        <button
            v-for="i in 5"
            :key="i"
            type="button"
            class="btn btn-link"
            :class="{ 'disabled': usedVotes.includes(i) && savedVote != i }"
            @click="updateVote(i)"
        >
            <i
                class="fa-star"
                :class="{'fas': usedVotes.includes(i) || savedVote == i, 'far': !usedVotes.includes(i) }"
            />
        </button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { JudgingPlacement } from '../../../interfaces/contest/judging';

export default Vue.extend({
    name: 'JudgingVote',
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
        ...mapGetters(['usedVotes']),
    },
    methods: {
        async updateVote(vote): Promise<void> {
            if (this.savedVote == vote) {
                vote = JudgingPlacement.None;
            }

            const submission = await this.executePost('/judging/updateSubmission/' + this.submissionId, { vote });

            if (!this.isError(submission)) {
                this.$store.commit('updateSubmission', submission);
            }
        },
    },
});
</script>
