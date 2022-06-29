<template>
    <div>
        <!--<p v-if="!submissions.length">
            <button
                type="button"
                class="btn btn-sm btn-outline-info"
                @click="addSubmissionsFromCsv($event)"
            >
                Add submissions from CSV (local only)
            </button>
        </p>-->

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
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Submission } from '../../../../interfaces/contest/submission';

export default defineComponent({
    name: 'SubmissionsInfo',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        submissions: {
            type: Array as () => Submission[],
            required: true,
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
        };
    },
    watch: {
        manualAnonEdit() {
            this.findAnonymousSubmissionName();
        },
    },
    methods: {
        /*async addSubmissionsFromCsv(e): Promise<void> {
            const submissions = await this.$http.executePost(`/admin/contests/${this.contestId}/submissions/createFromCsv`, {}, e);

            if (!this.$http.isError(submissions)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `added csv entries`,
                    type: 'info',
                });
                this.$store.commit('addSubmissionsFromCsv', {
                    contestId: this.contestId,
                    submissions,
                });
            }
        },*/
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
