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
import { ScreeningPlacement } from '../../../interfaces/contest/screening';

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
        ...mapGetters(['usedVotes']),
    },
    methods: {
        async updateVote(vote): Promise<void> {
            if (this.savedVote == vote) {
                vote = ScreeningPlacement.None;
            }

            const submission = await this.executePost('/screening/updateSubmission/' + this.submissionId, { vote });

            if (!this.isError(submission)) {
                this.$store.commit('updateSubmission', submission);
            }
        },
    },
});
</script>
