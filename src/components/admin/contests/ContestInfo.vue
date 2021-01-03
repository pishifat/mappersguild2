<template>
    <div
        class="container card card-body py-3 mb-2"
    >
        <h4 class="text-center">
            {{ contest.name }}
        </h4>

        <div class="container">
            <date-info
                :contest-id="contest.id"
                :contest-start="contest.contestStart ? contest.contestStart.slice(0,10) : null"
            />
            <gimmick-toggle
                :contest-id="contest.id"
                :is-theme="contest.isTheme"
            />
            <status-info
                :contest-id="contest.id"
                :status="contest.status"
            />

            <div>
                <h5>
                    Screeners and Judges
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-info"
                        @click="screenersAndJudgesVisible = !screenersAndJudgesVisible"
                    >
                        {{ screenersAndJudgesVisible ? 'Hide' : 'Show' }}
                    </button>
                </h5>

                <div v-if="screenersAndJudgesVisible" class="row">
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

                    <markdown-helper-thanks
                        :screeners="contest.screeners"
                        :judges="contest.judges"
                    />
                </div>

                <h5>
                    Submissions
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-info"
                        @click="submissionsVisible = !submissionsVisible"
                    >
                        {{ submissionsVisible ? 'Hide' : 'Show' }}
                    </button>
                </h5>

                <submissions-info
                    v-if="submissionsVisible"
                    :contest-id="contest.id"
                    :submissions="contest.submissions"
                />

                <div v-if="contest.submissions.length">
                    <h5>
                        Screening Results
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-info"
                            @click="screeningResultsVisible = !screeningResultsVisible"
                        >
                            {{ screeningResultsVisible ? 'Hide' : 'Show' }}
                        </button>
                    </h5>
                    <screening-results
                        v-if="screeningResultsVisible"
                        :contest-id="contest.id"
                        :contest-name="contest.name"
                        :submissions="contest.submissions"
                        :judging-threshold="contest.judgingThreshold"
                    />
                    <h5>
                        Judging Results
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-info"
                            @click="judgingResultsVisible = !judgingResultsVisible"
                        >
                            {{ judgingResultsVisible ? 'Hide' : 'Show' }}
                        </button>
                    </h5>
                    <judging-results
                        v-if="judgingResultsVisible"
                        :contest-id="contest.id"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Contest } from '../../../../interfaces/contest/contest';
import DateInfo from './DateInfo.vue';
import StatusInfo from './StatusInfo.vue';
import ScreenersInfo from './ScreenersInfo.vue';
import JudgesInfo from './JudgesInfo.vue';
import ScreeningResults from './ScreeningResults.vue';
import JudgingResults from './JudgingResults.vue';
import GimmickToggle from './GimmickToggle.vue';
import SubmissionsInfo from './SubmissionsInfo.vue';
import MarkdownHelperThanks from './MarkdownHelperThanks.vue';

export default defineComponent({
    name: 'ContestInfo',
    components: {
        DateInfo,
        StatusInfo,
        ScreenersInfo,
        JudgesInfo,
        ScreeningResults,
        JudgingResults,
        GimmickToggle,
        SubmissionsInfo,
        MarkdownHelperThanks,
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
            screenersAndJudgesVisible: false,
            submissionsVisible: false,
            screeningResultsVisible: false,
            judgingResultsVisible: false,
        };
    },
});
</script>