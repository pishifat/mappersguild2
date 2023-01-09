<template>
    <div>
        <contest-header
            :contest-id="contest.id"
            :name="contest.name"
            :url="contest.url"
            :creators="contest.creators"
        />

        <contest-banner
            v-if="contest.bannerUrl"
            :banner-url="contest.bannerUrl"
        />

        <h5>General</h5>

        <div>
            <name
                class="mb-2"
                :contest-id="contest.id"
                :name="contest.name"
            />
            <status-info
                class="mb-2"
                :contest-id="contest.id"
                :status="contest.status"
                :is-approved="contest.isApproved"
            />

            <mode-info
                class="mb-2"
                :contest-id="contest.id"
                :mode="contest.mode"
            />

            <featured-artist-contest-toggle
                class="mb-2"
                :contest-id="contest.id"
                :is-featured-artist-contest="contest.isFeaturedArtistContest"
            />

            <date-info
                class="mb-2"
                :contest-id="contest.id"
                :contest-start="contest.contestStart ? contest.contestStart.slice(0,10) : null"
                :contest-end="contest.contestEnd ? contest.contestEnd.slice(0,10) : null"
            />

            <urls
                :contest-id="contest.id"
                :url="contest.url || undefined"
                :osu-contest-listing-url="contest.osuContestListingUrl || undefined"
                :results-url="contest.resultsUrl || undefined"
                :banner-url="contest.bannerUrl || undefined"
            />

            <description
                :contest-id="contest.id"
                :description="contest.description"
            />

            <hr />

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
                    :osu-contest-listing-url="contest.osuContestListingUrl"
                />

                <download-info
                    :contest-id="contest.id"
                    :download="contest.download"
                />

                <div class="ms-2 mb-2">
                    <a href="#anonymizationGuide" data-bs-toggle="collapse" @click.prevent>
                        See submission anonymization guide
                        <i class="fas fa-angle-down" />
                    </a>
                </div>

                <anonymization-guide
                    id="anonymizationGuide"
                    class="collapse"
                    :contest-id="contest.id"
                />

                <hr />

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

                <div id="screeners" class="row collapse mb-2">
                    <screeners-info
                        class="col-sm-4"
                        :contest-id="contest.id"
                        :screeners="contest.screeners"
                    />

                    <markdown-user-list
                        class="col-sm-7"
                        :users="contest.screeners"
                    />
                    <div class="text-danger small col-sm-12">
                        Note: Deleting a user from this list will remove all of their screening progress.
                    </div>
                </div>



                <div>To begin screening, send this link to the users above and ensure your contest's status is set to "Screening"!</div>
                <code>https://mappersguild.com/contests/screening?contest={{ contest.id }}</code>

                <hr />

                <h5>
                    Screening Results
                </h5>

                <div class="row mb-2">
                    <screening-vote-count
                        class="col-sm-4"
                        :contest-id="contest.id"
                        :screening-vote-count="contest.screeningVoteCount"
                    />

                    <div class="col-sm-8 small text-secondary">
                        The amount of submissions each screener can give a vote to. The limit is set to "5" by default, meaning screeners can choose the top 5 maps. The limit is 10.
                    </div>
                </div>

                <div class="ms-2 mb-2">
                    <a href="#screeningStatus" data-bs-toggle="collapse" @click.prevent>
                        See screening status per screener
                        <i class="fas fa-angle-down" />
                    </a>
                </div>

                <screening-status
                    id="screeningStatus"
                    class="collapse mx-2"
                    :contest="contest"
                />

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

                <hr />

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

                <div id="judges" class="row collapse mb-2">
                    <judges-info
                        class="col-sm-4"
                        :contest-id="contest.id"
                        :judges="contest.judges"
                    />

                    <markdown-user-list
                        class="col-sm-7"
                        :users="contest.judges"
                    />

                    <div class="text-danger small col-sm-12">
                        Note: Deleting a user from this list will remove all of their judging progress.
                    </div>
                </div>

                <div>To begin judging, send this link to the users above and ensure your contest's status is set to "Judging"!</div>
                <code>https://mappersguild.com/contests/judging?contest={{ contest.id }}</code>

                <hr />

                <h5>
                    Judging Criteria
                </h5>
                <criteria-selection
                    :contest-id="contest.id"
                    :criterias="contest.criterias"
                />

                <hr />

                <h5>
                    Judging Results
                </h5>

                <judging-results
                    :contest-id="contest.id"
                />

                <hr />

                <button v-if="contest.status == 'hidden' && !contest.submissions.length" class="btn btn-sm btn-outline-danger w-100" @click="deleteContest($event)">
                    Delete contest
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Contest } from '@interfaces/contest/contest';
import ContestHeader from './ContestHeader.vue';
import ContestBanner from './ContestBanner.vue';
import DateInfo from './DateInfo.vue';
import Name from './Name.vue';
import StatusInfo from './StatusInfo.vue';
import ModeInfo from './ModeInfo.vue';
import AnonymizationGuide from './AnonymizationGuide.vue';
import Urls from './Urls.vue';
import Description from './Description.vue';
import SubmissionsInfo from './SubmissionsInfo.vue';
import DownloadInfo from './DownloadInfo.vue';
import ScreenersInfo from './screening/ScreenersInfo.vue';
import ScreeningStatus from './screening/ScreeningStatus.vue';
import JudgesInfo from './judging/JudgesInfo.vue';
import MarkdownUserList from './MarkdownUserList.vue';
import ScreeningResults from './screening/ScreeningResults.vue';
import JudgingThreshold from './screening/JudgingThreshold.vue';
import ScreeningVoteCount from './screening/ScreeningVoteCount.vue';
import CriteriaSelection from './judging/CriteriaSelection.vue';
import JudgingResults from './judging/JudgingResults.vue';
import FeaturedArtistContestToggle from './FeaturedArtistContestToggle.vue';

export default defineComponent({
    name: 'ContestInfo',
    components: {
        ContestHeader,
        ContestBanner,
        DateInfo,
        Name,
        AnonymizationGuide,
        ModeInfo,
        StatusInfo,
        SubmissionsInfo,
        DownloadInfo,
        Urls,
        Description,
        ScreenersInfo,
        JudgesInfo,
        MarkdownUserList,
        ScreeningResults,
        ScreeningStatus,
        JudgingThreshold,
        ScreeningVoteCount,
        CriteriaSelection,
        JudgingResults,
        FeaturedArtistContestToggle,
    },
    props: {
        contest: {
            type: Object as () => Contest,
            required: true,
        },
    },
    data() {
        return {
            screenersAndJudgesVisible: false,
            submissionsVisible: false,
            screeningResultsVisible: false,
            judgingCriteriaVisible: false,
            judgingResultsVisible: false,
        };
    },
    methods: {
        async deleteContest(e): Promise<void> {
            const result = confirm(`Are you sure?`);

            if (result) {
                const res = await this.$http.executePost(`/contests/listing/${this.contest.id}/delete`, {}, e);

                if (!this.$http.isError(res)) {
                    this.$store.dispatch('updateToastMessages', {
                        message: `Deleted contest`,
                        type: 'info',
                    });
                    this.$store.commit('deleteContest', this.contest.id);
                }
            }
        },
    },
});
</script>