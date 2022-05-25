<template>
    <div>
        <contest-header
            :name="contest.name"
            :url="contest.url"
            :creator="contest.creator"
        />

        <h5>General</h5>

        <div>
            <status-info
                class="mb-2"
                :contest-id="contest.id"
                :status="contest.status"
                :contest-start="contest.contestStart"
                :contest-end="contest.contestEnd"
            />

            <date-info
                class="mb-2"
                :contest-id="contest.id"
                :contest-start="contest.contestStart ? contest.contestStart.slice(0,10) : null"
                :contest-end="contest.contestEnd ? contest.contestEnd.slice(0,10) : null"
            />

            <urls
                :contest-id="contest.id"
                :url="contest.url || null"
                :osu-contest-listing-url="contest.osuContestListingUrl || null"
            />

            <description
                :contest-id="contest.id"
                :description="contest.description"
            />

            <hr>

            <div>
                <h5>
                    Submissions
                </h5>
                <div class="ms-2 mb-2">
                    <a href="#submissions" data-bs-toggle="collapse" @click.prevent>
                        See all submissions ({{ contest.submissions.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                </div>

                <submissions-info
                    id="submissions"
                    class="collapse"
                    :contest-id="contest.id"
                    :submissions="contest.submissions"
                />

                <download-info
                    :contest-id="contest.id"
                    :download="contest.download"
                />

                <hr>

                <h4 class="mb-4">
                    Screening
                </h4>

                <h5>
                    Screeners
                </h5>

                <div class="ms-2 mb-2">
                    <a href="#screeners" data-bs-toggle="collapse" @click.prevent>
                        See all screeners ({{ contest.screeners.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                </div>

                <div id="screeners" class="row collapse">
                    <screeners-info
                        class="col-sm-4"
                        :contest-id="contest.id"
                        :screeners="contest.screeners"
                    />

                    <markdown-user-list
                        class="col-sm-7"
                        :users="contest.screeners"
                    />
                </div>

                <div>send this link to your screeners [insert link]. make sure contest status is set to "Screening"!</div>

                <hr>

                <h5>
                    Screening Results
                </h5>

                <div class="row mb-2">
                    <judging-threshold
                        class="col-sm-4"
                        :contest-id="contest.id"
                        :judging-threshold="contest.judgingThreshold"
                    />

                    <div class="col-sm-8 small text-secondary">
                        Submissions with this <i class="fa-star fas text-warning small" /> score or above in "screening results" will be available to judges. If your contest skips the screening process, set this to "0".
                    </div>
                </div>

                <div class="ms-2 mb-2">
                    <a href="#screeningResults" data-bs-toggle="collapse" @click.prevent>
                        See screening results
                        <i class="fas fa-angle-down" />
                    </a>
                </div>

                <screening-results
                    id="screeningResults"
                    class="collapse"
                    :contest-id="contest.id"
                    :contest-name="contest.name"
                    :submissions="contest.submissions"
                    :judging-threshold="contest.judgingThreshold"
                    :screeners="contest.screeners"
                />

                <hr>

                <h4 class="mb-4">
                    Judging
                </h4>

                <h5>
                    Judges
                </h5>

                <div class="ms-2 mb-2">
                    <a href="#judges" data-bs-toggle="collapse" @click.prevent>
                        See all judges ({{ contest.judges.length }})
                        <i class="fas fa-angle-down" />
                    </a>
                </div>

                <div id="judges" class="row collapse">
                    <judges-info
                        class="col-sm-4"
                        :contest-id="contest.id"
                        :judges="contest.judges"
                    />

                    <markdown-user-list
                        class="col-sm-7"
                        :users="contest.judges"
                    />
                </div>

                <div>send this link to your judges [insert link]. make sure contest status is set to "Judging" and your download link includes only relevant submissions!</div>

                <hr>

                <h5>
                    Judging Criteria
                </h5>
                <criteria-selection
                    :contest-id="contest.id"
                    :criterias="contest.criterias"
                />

                <hr>

                <h5>
                    Judging Results
                </h5>

                <judging-results
                    :contest-id="contest.id"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Contest } from '@interfaces/contest/contest';
import ContestHeader from './ContestHeader.vue';
import DateInfo from './DateInfo.vue';
import StatusInfo from './StatusInfo.vue';
import Urls from './Urls.vue';
import Description from './Description.vue';
import SubmissionsInfo from './SubmissionsInfo.vue';
import DownloadInfo from './DownloadInfo.vue';
import ScreenersInfo from './screening/ScreenersInfo.vue';
import JudgesInfo from './judging/JudgesInfo.vue';
import MarkdownUserList from './MarkdownUserList.vue';
import ScreeningResults from './screening/ScreeningResults.vue';
import JudgingThreshold from './screening/JudgingThreshold.vue';
import CriteriaSelection from './judging/CriteriaSelection.vue';
import JudgingResults from './judging/JudgingResults.vue';

export default defineComponent({
    name: 'ContestInfo',
    components: {
        ContestHeader,
        DateInfo,
        StatusInfo,
        SubmissionsInfo,
        DownloadInfo,
        Urls,
        Description,
        ScreenersInfo,
        JudgesInfo,
        MarkdownUserList,
        ScreeningResults,
        JudgingThreshold,
        CriteriaSelection,
        JudgingResults,
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
            judgingCriteriaVisible: false,
            judgingResultsVisible: false,
        };
    },
});
</script>