<template>
    <div
        id="detailModal"
        class="modal fade"
        tabindex="-1"
    >
        <div class="modal-dialog modal-lg">
            <div v-if="submission" class="modal-content bg-dark">
                <div class="modal-header">
                    <h5 class="modal-title">
                        {{ submission.creator.username }}
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
                    <div
                        v-for="(judging, i) in submission.judgings"
                        :key="judging.id"
                    >
                        <b>{{ judging.judge.username }}</b>

                        <div
                            v-for="judgingScore in judging.judgingScores"
                            :key="judgingScore.id"
                            class="my-1"
                        >
                            <a
                                data-toggle="collapse"
                                :href="`#judgingToCriteria${judgingScore.id}`"
                                @click="showComment(judgingScore.id)"
                            >
                                <small>
                                    <i
                                        class="fas mr-2"
                                        :class="getCollapseClass(judgingScore.id)"
                                    />
                                </small>
                                {{ judgingScore.criteria.name }}
                                <b>({{ judgingScore.score }})</b>:
                            </a>


                            <p
                                :id="`judgingToCriteria${judgingScore.id}`"
                                class="text-light ml-3 collapse"
                            >
                                <span style="white-space: pre-line;">{{ judgingScore.comment }}</span>
                            </p>
                        </div>

                        <hr v-if="i < submission.judgings.length - 1">
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
