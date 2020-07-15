<template>
    <div>
        <p>
            Add submission:
            <input
                v-model="name"
                class="form-control-sm w-25"
                type="text"
                autocomplete="off"
                placeholder="new submission's name..."
            >
            <input
                v-model="creatorOsuId"
                class="form-control-sm w-25"
                type="text"
                autocomplete="off"
                placeholder="new submission's creator osuId..."
            >
            <button
                type="button"
                class="btn btn-sm btn-outline-info"
                @click="addSubmission($event)"
            >
                Save
            </button>
        </p>

        <ul v-if="submissions.length">
            <li
                v-for="submission in submissions"
                :key="submission.id"
            >
                {{ submission.name }}
                <span class="text-white-50">by</span>
                <a :href="'https://osu.ppy.sh/users/' + submission.creator.osuId" target="_blank">
                    {{ submission.creator.username }}
                </a>


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
import Vue from 'vue';
import { Submission } from '../../../../interfaces/contest/submission';

export default Vue.extend({
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
            const submission = await this.executePost(`/admin/contests/${this.contestId}/submissions/create`, {
                name: this.name,
                osuId: this.creatorOsuId,
            }, e);

            if (!this.isError(submission)) {
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
        async deleteSubmission(submissionId, e): Promise<void> {
            const res = await this.executePost(`/admin/contests/${this.contestId}/submissions/${submissionId}/delete`, {}, e);

            if (!this.isError(res)) {
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
