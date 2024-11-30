<template>
    <modal-dialog id="detailModal" :loaded="Boolean(submission)">
        <template #header>
            {{ submission.creator.username }}
            ({{ submission.name }})
            ({{ submission.id }})
        </template>

        <template #default>
            <div class="container">
                <div
                    v-for="(judging, i) in submission.judgings"
                    :key="judging.id"
                >
                    <user-link :user="judging.judge" />

                    <div
                        v-for="judgingScore in judging.judgingScores"
                        :key="judgingScore.id"
                        class="my-1"
                    >
                        <a
                            v-if="judgingScore.criteria.name == 'comments'"
                            class="small fw-bold text-capitalize"
                            data-bs-toggle="collapse"
                            :href="`#judgingToCriteria${judgingScore.id}`"
                            @click="showComment(judgingScore.id)"
                        >
                            <i
                                class="small fas me-2"
                                :class="getCollapseClass(judgingScore.id)"
                            />
                            {{ judgingScore.criteria.name }}
                        </a>
                        <span v-else class="small text-capitalize ms-3">
                            {{ judgingScore.criteria.name }}
                            ({{ judgingScore.score }})
                        </span>
                        <span v-if="loggedInUser.username == 'pishifat'" class="small text-secondary ms-1">{{ judgingScore.id }}</span>


                        <p
                            :id="`judgingToCriteria${judgingScore.id}`"
                            class="text-light ms-4 collapse"
                        >
                            <span class="small text-secondary" style="white-space: pre-line;">{{ judgingScore.comment }}</span>
                        </p>
                    </div>

                    <hr v-if="i < submission.judgings.length - 1" />
                </div>
            </div>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import ModalDialog from '@components/ModalDialog.vue';

export default defineComponent({
    name: 'JudgingDetail',
    components: {
        ModalDialog,
    },
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
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
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
