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
                    <th>Link</th>
                    <th>Delete</th>
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
                    <td><a :href="submission.url" target="_blank">{{ submission.url }}</a></td>
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
        };
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
