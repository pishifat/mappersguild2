<template>
    <div>
        <div
            v-for="contest in contests"
            :key="contest.id"
            class="container card card-body py-1"
        >
            <div class="row">
                <div class="col-sm">
                    <h4 class="my-2">
                        {{ contest.name }}
                    </h4>
                    <h5>
                        <a :href="contest.download" target="_blank">
                            {{ contest.download }}
                        </a>
                    </h5>

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
            No contests available for screening.
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import SubmissionCard from '@components/screening/SubmissionCard.vue';
import screeningModule from '@store/screening';

export default defineComponent({
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
    unmounted () {
        if (this.$store.hasModule('screening')) {
            this.$store.unregisterModule('screening');
        }
    },
    async created () {
        const res: any = await this.$http.initialRequest('/contests/screening/relevantInfo');

        if (!this.$http.isError(res)) {
            this.$store.commit('setContests', res.contests || []);
        }
    },
});
</script>
