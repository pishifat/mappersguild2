<template>
    <div>
        <p>
            Submissions:
            <input
                v-model="name"
                class="form-control-sm"
                type="text"
                autocomplete="off"
                placeholder="new submission's name..."
            >
            <input
                v-model="creatorOsuId"
                class="form-control-sm"
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

        <div v-if="submissions.length">
            <div
                v-for="submission in sortedSubmissions"
                :key="submission.id"
            >
                <div class="card card-body static-card p-3">
                    <div class="d-flex justify-content-between">
                        <a
                            data-toggle="collapse"
                            :href="`#collapse-${submission.id}`"
                        >
                            {{ submission.name }}
                            by {{ submission.creator.username }}
                            ({{ submission.total }} points in {{ submission.evaluations.length }} evaluations)
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
                            @click.prevent="deleteSubmission(submission.id)"
                        >
                            confirm
                        </a>
                    </div>
                </div>

                <div :id="`collapse-${submission.id}`" class="collapse">
                    <div class="my-2">
                        <judging-detail
                            :evaluations="submission.evaluations"
                        />
                        <message-template
                            :evaluations="submission.evaluations"
                            :osu-id="submission.creator.osuId"
                        />
                    </div>
                </div>
            </div>
        </div>

        <span v-else>None...</span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import JudgingDetail from './JudgingDetail.vue';
import MessageTemplate from './MessageTemplate.vue';
import { Submission } from '../../../../interfaces/contest/submission';

export default Vue.extend({
    name: 'SubmissionsInfo',
    components: {
        JudgingDetail,
        MessageTemplate,
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
    },
    data () {
        return {
            name: '',
            creatorOsuId: '',
            showDetail: false,
            confirmDelete: null,
        };
    },
    computed: {
        sortedSubmissions(): any[] {
            const sortedSubmissions: any = [...this.submissions];

            for (let i = 0; i < sortedSubmissions.length; i++) {
                const submission = sortedSubmissions[i];
                const total = submission.evaluations.reduce((acc, e) => {
                    if (e.vote) {
                        return acc + e.vote;
                    }

                    return acc;
                }, 0);
                sortedSubmissions[i].total = total;
            }

            sortedSubmissions.sort((a, b) => {
                if (a.total > b.total) return -1;
                if (b.total > a.total) return 1;

                return 0;
            });

            return sortedSubmissions;
        },
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
