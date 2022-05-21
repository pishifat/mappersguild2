<template>
    <div class="row">
        <div class="col-sm-6">
            Link to your beatmap:
            <span v-if="!submission" class="me-2 text-secondary">No submission yet!</span>
            <a
                v-else-if="submission && submission.url"
                :href="submission.url"
                target="_blank"
            >
                {{ submission.url }}
            </a>
            <input
                v-model="newSubmissionUrl"
                class="form-control form-control-sm w-75 d-inline"
                type="text"
                autocomplete="off"
                placeholder="link..."
                @change="updateSubmissionUrl($event)"
            >
        </div>
        <div class="col-sm-6 small text-secondary">
            Upload your beatmap to a file sharing service and provide a link here! For various reasons, this website does not host beatmap uploads.
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Contest } from '@interfaces/contest/contest';
import { Submission } from '@interfaces/contest/submission';

export default defineComponent({
    name: 'MapSubmissionForm',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        contest: {
            type: Object as () => Contest,
            required: true,
        },
    },
    data () {
        return {
            newSubmissionUrl: this.download,
        };
    },
    computed: {
        submission(): Submission {
            console.log(this.contest);

            return this.contest.submissions[0];
        },
    },
    methods: {
        async updateSubmissionUrl(e): Promise<void> {
            const submissions = await this.$http.executePost(`/contests/listing/${this.contestId}/submitBeatmap`, { submissionUrl: this.newSubmissionUrl }, e);

            if (!this.$http.isError(submissions)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Submitted!`,
                    type: 'info',
                });
                this.$store.commit('updateSubmissions', {
                    contestId: this.contestId,
                    submissions,
                });
            }
        },
    },
});
</script>

<style scoped>

.date-input {
    width: 10%;
}

</style>