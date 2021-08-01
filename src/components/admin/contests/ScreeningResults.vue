<template>
    <div>
        <p>
            Judging threshold:
            <input
                v-model="newJudgingThreshold"
                class="form-control form-control-sm w-25"
                type="text"
                autocomplete="off"
                placeholder="lowest score judges see..."
            >
            <button
                type="button"
                class="btn btn-sm btn-outline-info"
                @click="updateJudgingThreshold($event)"
            >
                Save
            </button>
        </p>
        <ul>
            <li
                v-for="submission in sortedSubmissions"
                :key="submission.id"
            >
                <div class="d-flex justify-content-between">
                    <a
                        :class="submission.total >= judgingThreshold ? 'text-success' : ''"
                        data-bs-toggle="collapse"
                        :href="`#collapse-${submission.id}`"
                    >
                        {{ submission.name }}
                        ({{ submission.total }})
                        <i class="fas fa-angle-down" />
                    </a>
                </div>

                <div :id="`collapse-${submission.id}`" class="collapse">
                    <div>
                        <screening-detail
                            :evaluations="submission.evaluations"
                        />
                        <message-template
                            :osu-id="submission.creator.osuId"
                            :submission-id="submission.id"
                            :contest-name="contestName"
                            :contest-id="contestId"
                        />
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ScreeningDetail from './ScreeningDetail.vue';
import MessageTemplate from './MessageTemplate.vue';
import { Submission } from '../../../../interfaces/contest/submission';

export default defineComponent({
    name: 'ScreeningResults',
    components: {
        ScreeningDetail,
        MessageTemplate,
    },
    props: {
        contestId: {
            type: String,
            required: true,
        },
        contestName: {
            type: String,
            required: true,
        },
        judgingThreshold: {
            type: Number,
            default: 0,
        },
        submissions: {
            type: Array as () => Submission[],
            required: true,
        },
    },
    data () {
        return {
            newJudgingThreshold: this.judgingThreshold,
        };
    },
    computed: {
        sortedSubmissions(): Submission[] {
            // "Deep copy" to avoid vuex complains
            const sortedSubmissions: Submission[] = JSON.parse(JSON.stringify(this.submissions));

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
        async updateJudgingThreshold(e): Promise<void> {
            const judgingThreshold = await this.$http.executePost(`/admin/contests/${this.contestId}/updateJudgingThreshold`, { judgingThreshold: this.newJudgingThreshold }, e);

            if (!this.$http.isError(judgingThreshold)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated judging threshold`,
                    type: 'info',
                });
                this.$store.commit('updateJudgingThreshold', {
                    contestId: this.contestId,
                    judgingThreshold,
                });
            }
        },
    },
});
</script>
