<template>
    <div class="row">
        <div class="col-sm-12 mb-2">
            Current submission:
            <span v-if="!userSubmission" class="me-2 text-secondary">No submission yet!</span>
            <current-submission v-else-if="userSubmission && userSubmission.url" />
        </div>
        <div class="col-sm-8">
            <input
                v-model="newSubmissionUrl"
                class="form-control form-control-sm w-100 d-inline"
                type="text"
                autocomplete="off"
                placeholder="link..."
            />
        </div>
        <div class="col-sm-4">
            <button class="btn btn-sm btn-outline-info w-100" @click="createSubmission($event)">
                Submit
            </button>
        </div>
        <div class="small text-secondary">
            Upload your beatmap to a file sharing service and provide a link here! For various reasons, this website does not host beatmap uploads.
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import CurrentSubmission from './CurrentSubmission.vue';

export default defineComponent({
    name: 'MapSubmissionForm',
    components: {
        CurrentSubmission,
    },
    props: {
        contestId: {
            type: String,
            required: true,
        },
    },
    data () {
        return {
            newSubmissionUrl: '',
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapGetters([
            'userSubmission',
        ]),
    },
    watch: {
        contestId(): void {
            this.newSubmissionUrl = this.userSubmission ? this.userSubmission.url : '';
        },
    },
    methods: {
        async createSubmission(e): Promise<void> {
            const submissions = await this.$http.executePost(`/contests/listing/${this.contestId}/createSubmission`, { url: this.newSubmissionUrl }, e);

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