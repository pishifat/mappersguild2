<template>
    <div class="min-spacing mt-1 row">
        <!-- maybe ? -->
        <div class="col-sm">
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

        <!-- <div class="col-sm-2">
            <select v-model="newVote" class="form-control form-control-sm mx-2" @change="updateVote()">
                <option value="0">
                    no value
                </option>
                <option v-if="!usedVotes.includes(1) || savedVote == 1" value="1">
                    5th
                </option>
                <option v-if="!usedVotes.includes(2) || savedVote == 2" value="2">
                    4th
                </option>
                <option v-if="!usedVotes.includes(3) || savedVote == 3" value="3">
                    3rd
                </option>
                <option v-if="!usedVotes.includes(4) || savedVote == 4" value="4">
                    2nd
                </option>
                <option v-if="!usedVotes.includes(5) || savedVote == 5" value="5">
                    1st
                </option>
            </select>
        </div> -->
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
    // data () {
    //     return {
    //         newVote: this.savedVote,
    //     };
    // },
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
