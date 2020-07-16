<template>
    <div
        id="detailModal"
        class="modal fade"
        tabindex="-1"
    >
        <div class="modal-dialog modal-lg">
            <div v-if="submission" class="modal-content bg-dark">
                <div class="modal-header text-dark bg-orange">
                    <h5 class="modal-title">
                        {{ submission.creator.username }}
                        ({{ submission.name }})
                    </h5>
                    <button
                        type="button"
                        class="close"
                        data-dismiss="modal"
                    >
                        &times;
                    </button>
                </div>

                <div class="modal-body text-left">
                    <div class="container">
                        <div
                            v-for="(judging, i) in submission.judgings"
                            :key="judging.id"
                        >
                            <a :href="'https://osu.ppy.sh/users/' + judging.judge.osuId" target="_blank">
                                {{ judging.judge.username }}
                            </a>

                            <div
                                v-for="judgingScore in judging.judgingScores"
                                :key="judgingScore.id"
                                class="my-1"
                            >
                                <a
                                    v-if="judgingScore.criteria.name == 'comments'"
                                    class="small font-weight-bold text-capitalize"
                                    data-toggle="collapse"
                                    :href="`#judgingToCriteria${judgingScore.id}`"
                                    @click="showComment(judgingScore.id)"
                                >
                                    <i
                                        class="small fas mr-2"
                                        :class="getCollapseClass(judgingScore.id)"
                                    />
                                    {{ judgingScore.criteria.name }}
                                </a>
                                <span v-else class="small text-capitalize ml-3">
                                    {{ judgingScore.criteria.name }}
                                    ({{ judgingScore.score }})
                                </span>


                                <p
                                    :id="`judgingToCriteria${judgingScore.id}`"
                                    class="text-light ml-4 collapse"
                                >
                                    <span class="small text-white-50" style="white-space: pre-line;">{{ judgingScore.comment }}</span>
                                </p>
                            </div>

                            <hr v-if="i < submission.judgings.length - 1">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'JudgingDetail',
    props: {
        submission: {
            type: Object,
            default: null,
        },
    },
    data () {
        return {
            commentsExpanded: [] as number[],
        };
    },
    methods: {
        showComment (id: number): void {
            const i = this.commentsExpanded.findIndex(j => j === id);
            i !== -1 ? this.commentsExpanded.splice(i, 1) : this.commentsExpanded.push(id);
        },

        getCollapseClass (id: number): string {
            if (this.commentsExpanded.includes(id)) {
                return 'fa-chevron-down';
            }

            return 'fa-chevron-right';
        },
    },

});
</script>
