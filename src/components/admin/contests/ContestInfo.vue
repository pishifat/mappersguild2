<template>
    <div
        class="container bg-container py-3 mb-2"
    >
        <h5 class="text-center">
            {{ contest.name }}
        </h5>
        <div class="text-center">
            <date-info
                :contest-id="contest.id"
                :contest-start="contest.contestStart ? contest.contestStart.slice(0,10) : null"
            />
            <status-info
                :contest-id="contest.id"
                :status="contest.status"
            />
            <button
                type="button"
                class="btn btn-sm btn-outline-info"
                @click="toggleVisibility($event)"
            >
                {{ isVisible ? 'Hide' : 'Show' }} contest details
            </button>
        </div>

        <div v-if="visibleContestIds.includes(contest.id)">
            <hr>

            <div class="row">
                <screeners-info
                    class="col-sm-6"
                    :contest-id="contest.id"
                    :screeners="contest.screeners"
                />

                <judges-info
                    class="col-sm-6"
                    :contest-id="contest.id"
                    :judges="contest.judges"
                />
            </div>



            <hr>

            <submissions-info
                :contest-id="contest.id"
                :submissions="contest.submissions"
            />

            <div v-if="contest.submissions.length">
                <screening-results
                    :contest-id="contest.id"
                    :submissions="contest.submissions"
                />
                <judging-results
                    :contest-id="contest.id"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Contest } from '../../../../interfaces/contest/contest';
import { mapState } from 'vuex';
import DateInfo from './DateInfo.vue';
import StatusInfo from './StatusInfo.vue';
import ScreenersInfo from './ScreenersInfo.vue';
import JudgesInfo from './JudgesInfo.vue';
import ScreeningResults from './ScreeningResults.vue';
import JudgingResults from './JudgingResults.vue';
import SubmissionsInfo from './SubmissionsInfo.vue';

export default Vue.extend({
    name: 'ContestInfo',
    components: {
        DateInfo,
        StatusInfo,
        ScreenersInfo,
        JudgesInfo,
        ScreeningResults,
        JudgingResults,
        SubmissionsInfo,
    },
    props: {
        contest: {
            type: Object as () => Contest,
            required: true,
        },
    },
    data () {
        return {
            newContestStart: this.contest.contestStart,
            showContestStartDateInput: false,
        };
    },
    computed: {
        ...mapState([
            'visibleContestIds',
        ]),
        isVisible (): boolean {
            return this.visibleContestIds.includes(this.contest.id);
        },
    },
    methods: {
        toggleVisibility(): void {
            this.$store.dispatch('updateToastMessages', {
                message: `toggled visibility of "${this.contest.name}"`,
                type: 'info',
            });
            this.$store.commit('toggleVisibility', {
                contestId: this.contest.id,
            });
        },
    },
});
</script>