<template>
    <div>
        <div
            v-for="contest in contests"
            :key="contest.id"
            class="container card card-body py-1"
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

                    <p v-else class="ms-4">
                        No submissions...
                    </p>
                </div>
            </div>
        </div>

        <div v-if="!contests.length" class="text-center p-3">
            No contests available for screening...
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import SubmissionCard from '@components/screening/SubmissionCard.vue';
import screeningModule from '@store/screening';

export default Vue.extend({
    name: 'ScreeningPage',
    components: {
        SubmissionCard,
    },
    computed: mapState({
        contests: (state: any) => state.screening.contests,
    }),
    beforeCreate () {
        if (!this.$store.hasModule('screening')) {
            this.$store.registerModule('screening', screeningModule);
        }
    },
    destroyed() {
        if (this.$store.hasModule('screening')) {
            this.$store.unregisterModule('screening');
        }
    },
    async created () {
        const res: any = await this.initialRequest('/screening/relevantInfo');

        if (!this.isError(res)) {
            this.$store.commit('setContests', res.contests || []);
        }
    },
});
</script>
