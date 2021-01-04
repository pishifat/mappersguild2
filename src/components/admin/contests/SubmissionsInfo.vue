<template>
    <div>
        <p class="row">
            <input
                v-model="name"
                class="form-control form-control-sm w-25 col-sm-3 me-2"
                type="text"
                autocomplete="off"
                placeholder="new submission's name..."
            >
            <input
                v-model="creatorOsuId"
                class="form-control form-control-sm w-25 col-sm-3 me-2"
                type="text"
                autocomplete="off"
                placeholder="new submission's creator osuId..."
            >
            <button
                type="button"
                class="btn btn-sm btn-outline-info col-sm-3 me-2"
                @click="addSubmission($event)"
            >
                Add submission
            </button>
        </p>

        <p v-if="!submissions.length">
            <button
                type="button"
                class="btn btn-sm btn-outline-info"
                @click="addSubmissionsFromCsv($event)"
            >
                Add submissions from CSV (local only)
            </button>
        </p>

        <ul v-if="submissions.length">
            <li
                v-for="submission in submissions"
                :key="submission.id"
            >
                {{ submission.name }}
                <span class="text-white-50 me-1">by</span>
                <user-link :user="submission.creator" />

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
                    class="text-danger"
                    href="#"
                    @click.prevent="deleteSubmission(submission.id, $event)"
                >
                    confirm
                </a>
            </li>
        </ul>

        <div v-else>
            None...
        </div>
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
        };
    },
    methods: {
        async addSubmission(e): Promise<void> {
            const submission = await this.$http.executePost(`/admin/contests/${this.contestId}/submissions/create`, {
                name: this.name,
                osuId: this.creatorOsuId,
            }, e);

            if (!this.$http.isError(submission)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `added ${this.creatorOsuId} as ${this.name}`,
                    type: 'info',
                });
                this.$store.commit('addSubmission', {
                    contestId: this.contestId,
                    submission,
                });
            }
        },
        async addSubmissionsFromCsv(e): Promise<void> {
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
        },
        async deleteSubmission(submissionId, e): Promise<void> {
            const res = await this.$http.executePost(`/admin/contests/${this.contestId}/submissions/${submissionId}/delete`, {}, e);

            if (!this.$http.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `deleted`,
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
