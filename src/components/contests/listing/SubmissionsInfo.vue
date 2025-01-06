<template>
    <div>
        <div v-if="!submissions.length && osuContestListingUrl">
            <span class="small text-secondary">If your contest uses the osu! contest listing, follow the anonymization guide below and paste your <code>.csv</code> output here as raw text to add submissions:</span>

            <div class="row">
                <div class="col-sm-10">
                    <textarea
                        v-model="csvInput"
                        class="form-control form-inline"
                        rows="1"
                    />
                </div>
                <div class="col-sm-2">
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-info mt-1 mx-1"
                        @click="addSubmissionsFromCsv($event)"
                    >
                        Save
                    </button>
                </div>
                <!--<div class="col-sm-2">
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-info mt-1 mx-1"
                        @click="addJudgingsFromCsv($event)"
                    >
                        Save judging
                    </button>
                </div>-->
            </div>
        </div>

        <table
            v-if="submissions.length"
            class="table table-sm table-responsive-lg"
        >
            <thead>
                <tr>
                    <th>Creator</th>
                    <th>Anonymized name</th>
                    <th>Link</th>
                    <th />
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="submission in submissions"
                    :key="submission.id"
                >
                    <td>
                        <user-link
                            :user="submission.creator"
                        />
                    </td>
                    <td :class="submission.name ? '' : 'text-danger'">
                        <input
                            v-if="manualAnonEdit == submission.id"
                            v-model="newAnonymousName"
                            class="ml-1 form-control form-control-sm"
                            @change="updateAnonymousSubmissionName(submission.id, $event)"
                        />
                        <span v-else class="me-1">{{ submission.name || 'TBD' }}</span>
                        <a href="#" @click.prevent="manualAnonEdit == submission.id ? manualAnonEdit = null : manualAnonEdit = submission.id">
                            <i class="fas fa-edit" />
                        </a>
                    </td>
                    <td>
                        <a :href="submission.url" target="_blank">{{ submission.url }}</a>
                    </td>
                    <td>
                        <a
                            v-if="confirmDelete != submission.id"
                            href="#"
                            class="text-danger"
                            @click.prevent="confirmDelete = submission.id"
                        >
                            delete
                        </a>
                        <a
                            v-else
                            :class="processingDelete ? 'text-secondary disabled' : 'text-danger'"
                            href="#"
                            @click.prevent="deleteSubmission(submission.id, $event)"
                        >
                            confirm
                        </a>
                    </td>
                </tr>
            </tbody>
        </table>
        <manual-submission
            v-if="submissions.length"
            :contest-id="contestId"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Submission } from '../../../../interfaces/contest/submission';
import ManualSubmission from './ManualSubmission.vue';

export default defineComponent({
    name: 'SubmissionsInfo',
    components: {
        ManualSubmission,
    },
    props: {
        contestId: {
            type: String,
            required: true,
        },
        submissions: {
            type: Array as () => Submission[],
            required: true,
        },
        osuContestListingUrl: {
            type: String,
            default: '',
        },
    },
    data () {
        return {
            name: '',
            creatorOsuId: '',
            confirmDelete: null,
            processingDelete: false,
            manualAnonEdit: null,
            newAnonymousName: '',
            csvInput: '',
        };
    },
    watch: {
        manualAnonEdit() {
            this.findAnonymousSubmissionName();
        },
    },
    methods: {
        async addSubmissionsFromCsv(e): Promise<void> {
            const submissions = await this.$http.executePost(`/contests/listing/${this.contestId}/submissions/addSubmissionsFromCsv`, { csv: this.csvInput }, e);

            if (!this.$http.isError(submissions)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Added entries from .csv data`,
                    type: 'info',
                });
                this.$store.commit('addSubmissionsFromCsv', {
                    contestId: this.contestId,
                    submissions,
                });
            }
        },
        async addJudgingsFromCsv(e): Promise<void> {
            const submissions = await this.$http.executePost(`/contests/listing/${this.contestId}/addJudgingsFromCsv`, { csv: this.csvInput }, e);

            if (!this.$http.isError(submissions)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Added judgings from .csv data`,
                    type: 'info',
                });
            }
        },
        findAnonymousSubmissionName(): void {
            const relevantSubmission = this.submissions.find(s => s.id == this.manualAnonEdit);

            if (relevantSubmission) {
                this.newAnonymousName = relevantSubmission.name;
            }
        },
        async updateAnonymousSubmissionName(submissionId, e): Promise<void> {
            const name = await this.$http.executePost(`/contests/listing/${this.contestId}/submissions/${submissionId}/updateAnonymousSubmissionName`, { name: this.newAnonymousName }, e);

            if (!this.$http.isError(name)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated anonymous submission name`,
                    type: 'info',
                });
                // do the store thing later
                this.$store.commit('updateAnonymousSubmissionName', {
                    contestId: this.contestId,
                    submissionId,
                    name,
                });
            }
        },
        async deleteSubmission(submissionId, e): Promise<void> {
            this.processingDelete = true;
            const res = await this.$http.executePost(`/contests/listing/${this.contestId}/submissions/${submissionId}/delete`, {}, e);
            this.processingDelete = false;

            if (!this.$http.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Deleted submission`,
                    type: 'info',
                });
                this.$store.commit('deleteSubmission', {
                    contestId: this.contestId,
                    submissionId,
                });
            }
        },
    },
});
</script>
