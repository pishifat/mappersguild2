<template>
    <div class="col-sm-12 my-1">
        <div
            class="card static-card"
            :class="!relatedJudging || !relatedJudging.vote ? 'bg-dark' :
                relatedJudging.vote == 1 ? 'fifth-favorite' :
                relatedJudging.vote == 2 ? 'fourth-favorite' :
                relatedJudging.vote == 3 ? 'third-favorite' :
                relatedJudging.vote == 4 ? 'second-favorite' :
                relatedJudging.vote == 5 ? 'first-favorite' :
                ''"
        >
            <div class="card-body text-shadow p-2">
                <div class="row">
                    <div class="col-sm-6">
                        {{ submission.name }}
                    </div>

                    <div class="col-sm-6 text-right">
                        <judging-vote
                            :submission-id="submission.id"
                            :saved-vote="relatedJudging && relatedJudging.vote"
                        />
                    </div>
                </div>

                <div class="row">
                    <div class="col-sm">
                        <judging-notes
                            :submission-id="submission.id"
                            :saved-comment="relatedJudging && relatedJudging.comment"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import JudgingVote from '@components/judging/JudgingVote.vue';
import JudgingNotes from '@components/judging/JudgingNotes.vue';
import { Submission } from '../../../interfaces/contest/submission';
import { Judging } from '../../../interfaces/contest/judging';
import { mapState } from 'vuex';

export default Vue.extend({
    name: 'SubmssionCard',
    components: {
        JudgingVote,
        JudgingNotes,
    },
    props: {
        submission: {
            type: Object as () => Submission,
            required: true,
        },
    },
    computed: {
        ...mapState([
            'userId',
        ]),
        relatedJudging(): Judging | undefined {
            return this.submission.evaluations.find(e => e.judge._id === this.userId);
        },
    },
});
</script>

<style>
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

.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}

.w-10 {
    width: 10%;
}

.fifth-favorite {
    background-color: rgba(37, 119, 62, 0.1)!important;
}

.fourth-favorite {
    background-color: rgba(53, 111, 138, 0.1)!important;
}

.third-favorite {
    background-color: rgba(138, 98, 53, 0.1)!important;
}

.second-favorite {
    background-color: rgba(217, 224, 224, 0.15) !important;
}

.first-favorite {
    background-color: rgba(255, 251, 0, 0.075)!important;
}
</style>
