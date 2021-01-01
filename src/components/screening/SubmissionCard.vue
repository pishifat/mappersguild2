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
import Vue from 'vue';
import ScreeningVote from '@components/screening/ScreeningVote.vue';
import ScreeningNotes from '@components/screening/ScreeningNotes.vue';
import { Submission } from '../../../interfaces/contest/submission';
import { Screening } from '../../../interfaces/contest/screening';
import { mapState } from 'vuex';

export default Vue.extend({
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
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        relatedScreening(): Screening | undefined {
            return this.submission.evaluations.find(e => e.screener._id === this.loggedInUser.id);
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
