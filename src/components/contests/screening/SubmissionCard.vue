<template>
    <div class="col-sm-12 my-1">
        <div
            class="card"
            :class="relatedScreening && relatedScreening.vote ? 'bg-vote' : 'bg-dark'"
        >
            <div class="card-body p-2">
                <div class="row">
                    <div class="col-sm-6">
                        {{ submission.name }}
                    </div>

                    <div class="col-sm-6 text-end">
                        <screening-vote
                            :submission-id="submission.id"
                            :saved-vote="relatedScreening && relatedScreening.vote"
                            :screening-vote-count="screeningVoteCount"
                        />
                    </div>
                </div>

                <div class="row">
                    <div class="col-sm">
                        <screening-notes
                            :submission-id="submission.id"
                            :saved-comment="relatedScreening && relatedScreening.comment"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ScreeningVote from '@components/contests/screening/ScreeningVote.vue';
import ScreeningNotes from '@components/contests/screening/ScreeningNotes.vue';
import { Submission } from '@interfaces/contest/submission';
import { Screening } from '@interfaces/contest/screening';
import { mapState } from 'vuex';

export default defineComponent({
    name: 'SubmissionCard',
    components: {
        ScreeningVote,
        ScreeningNotes,
    },
    props: {
        submission: {
            type: Object as () => Submission,
            required: true,
        },
        screeningVoteCount: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        relatedScreening(): Screening | undefined {
            return this.submission.screenings.find(s => s.screener._id === this.loggedInUser.id);
        },
    },
});
</script>

<style scoped>
.font-8{
    font-size: 8pt;
}

input,
input:focus {
    background-color: #333;
    color: white;
    border-color: transparent;
    filter: drop-shadow(1px 1px 1px #000000);
    border-radius: 0 100px 100px 0;
}

.w-10 {
    width: 10%;
}

.bg-vote {
    background-color: rgba(255, 255, 0, 0.075)!important;
}
</style>
