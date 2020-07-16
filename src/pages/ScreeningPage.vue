<template>
    <div v-cloak>
        <div
            v-for="contest in contests"
            :key="contest.id"
            class="container bg-container py-1"
        >
            <div class="row">
                <div class="col-sm">
                    <h4 class="my-2 text-center">
                        {{ contest.name }}
                    </h4>

                    <transition-group
                        v-if="contest.submissions.length"
                        name="list"
                        tag="div"
                        class="row"
                    >
                        <submission-card
                            v-for="submission in contest.submissions"
                            :key="submission.id"
                            :submission="submission"
                        />
                    </transition-group>

                    <p v-else class="ml-4">
                        No submissions...
                    </p>
                </div>
            </div>
        </div>

        <div v-if="!contests.length" class="text-center p-3">
            No contests available for screening...
        </div>

        <toast-messages />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import ToastMessages from '@components/ToastMessages.vue';
import SubmissionCard from '@components/screening/SubmissionCard.vue';
import { mapState } from 'vuex';

export default Vue.extend({
    name: 'ScreeningPage',
    components: {
        ToastMessages,
        SubmissionCard,
    },
    computed: mapState(['contests']),
    async created () {
        const res: any = await this.executeGet('/screening/relevantInfo');

        if (!this.isError(res)) {
            this.$store.commit('setContests', res.contests);
            this.$store.commit('setUserId', res.userId);
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
    },
});
</script>
