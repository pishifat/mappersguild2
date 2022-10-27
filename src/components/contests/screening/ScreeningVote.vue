<template>
    <div>
        <a
            v-for="i in screeningVoteCount"
            :key="i"
            class="mx-1"
            :class="{ 'disabled-star': (usedVotes.includes(i) && savedVote != i) || voteLoading }"
            :disabled="voteLoading"
            href="#"
            @click.prevent="updateVote(i)"
        >
            <i
                class="fa-star fas"
                :class="{'text-warning': usedVotes.includes(i) && savedVote == i }"
            />
        </a>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import { ScreeningPlacement } from '@interfaces/contest/screening';

export default defineComponent({
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
        screeningVoteCount: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        ...mapState({
            voteLoading: (state: any) => state.screening.voteLoading as boolean,
        }),
        ...mapGetters(['usedVotes']),
    },
    methods: {
        async updateVote(vote): Promise<void> {
            this.$store.commit('setVoteLoading', true);

            if (this.savedVote == vote) {
                vote = ScreeningPlacement.None;
            }

            const submission = await this.$http.executePost('/contests/screening/updateSubmission/' + this.submissionId, { vote });

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