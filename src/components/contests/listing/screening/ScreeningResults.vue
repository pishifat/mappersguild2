<template>
    <div>
        <ul>
            <li
                v-for="submission in sortedSubmissions"
                :key="submission.id"
            >
                <div class="d-flex justify-content-between">
                    <a
                        :class="submission.total >= judgingThreshold ? 'pass-threshold' : ''"
                        data-bs-toggle="collapse"
                        :href="`#collapse-${submission.id}`"
                    >
                        <span class="text-warning">{{ submission.total }} <i class="fa-star fas small" /></span>
                        - {{ submission.creator.username }} ({{ submission.name }})
                        <i class="fas fa-angle-down" />
                    </a>
                </div>

                <div :id="`collapse-${submission.id}`" class="collapse">
                    <div>
                        <screening-detail
                            :screenings="submission.screenings"
                            :screeners="screeners"
                        />
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import ScreeningDetail from './ScreeningDetail.vue';
import { Submission } from '@interfaces/contest/submission';
import { User } from '@interfaces/user';

export default defineComponent({
    name: 'ScreeningResults',
    components: {
        ScreeningDetail,
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
        screeningBonus: {
            type: Boolean,
            default: false,
        },
        submissions: {
            type: Array as PropType<Submission[]>,
            required: true,
        },
        screeners: {
            type: Array as PropType<User[]>,
            default () {
                return [];
            },
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
                const total = submission.screenings.reduce((acc, e) => {
                    if (e.vote) {
                        if (this.screeningBonus) {
                            return acc + e.vote + 1;
                        } else {
                            return acc + e.vote;
                        }
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
});
</script>

<style scoped>

.pass-threshold {
    color: #36d8a2;
}

.pass-threshold:hover {
    color: lightgreen;
}

</style>