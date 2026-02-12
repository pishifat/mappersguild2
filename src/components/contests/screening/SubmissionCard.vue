<template>
    <div class="col-sm-12 my-1">
        <div
            class="card"
            :class="relatedScreening && relatedScreening.vote ? 'bg-vote' : 'bg-dark'"
        >
            <div class="card-body p-2">
                <div class="row">
                    <div class="col-sm-6">
                        <a
                            v-bs-tooltip:left="'strikethrough text'"
                            :class="disableStrikethrough ? 'fake-button-disable' : ''"
                            href="#"
                            @click.prevent="toggleReviewed()"
                        >
                            <i class="fa-solid fa-strikethrough" />
                        </a>
                        <span
                            class="ms-1"
                            :class="relatedScreening && relatedScreening.reviewed ? 'text-decoration-line-through text-secondary' : ''"
                        >
                            {{ submission.name }}
                        </span>
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
    data () {
        return {
            disableStrikethrough: false,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        relatedScreening(): Screening | undefined {
            return this.submission.screenings.find(s => s.screener._id === this.loggedInUser.id);
        },
    },
    methods: {
        async toggleReviewed(): Promise<void> {
            this.disableStrikethrough = true;
            const submission = await this.$http.executePost('/contests/screening/updateSubmission/' + this.submission.id, { toggleReviewed: true });

            if (!this.$http.isError(submission)) {
                this.$store.commit('updateSubmission', submission);
                this.disableStrikethrough = false;
            }
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
