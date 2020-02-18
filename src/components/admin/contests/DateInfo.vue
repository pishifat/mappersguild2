<template>
    <div>
        <p>
            Contest start date:
            <span class="text-white-50">{{ contestStart || 'No date set' }}</span>
            <input
                v-model="newContestStart"
                class="small date-input ml-2 form-control-sm"
                type="text"
                placeholder="mm-dd-yyyy"
                maxlength="10"
            >
            <button
                type="button"
                class="btn btn-sm btn-outline-info"
                @click="updateContestStart($event)"
            >
                Save
            </button>
        </p>
        <p>
            Judging start date:
            <span class="text-white-50">{{ judgingStart || 'No date set' }}</span>
            <input
                v-model="newJudgingStart"
                class="small date-input ml-2 form-control-sm"
                type="text"
                placeholder="mm-dd-yyyy"
                maxlength="10"
            >
            <button
                type="button"
                class="btn btn-sm btn-outline-info"
                @click="updateJudgingStart($event)"
            >
                Save
            </button>
        </p>
        <p>
            Results published:
            <span class="text-white-50">{{ resultsPublished || 'No date set' }}</span>
            <input
                v-model="newResultsPublished"
                class="small date-input ml-2 form-control-sm"
                type="text"
                placeholder="mm-dd-yyyy"
                maxlength="10"
            >
            <button
                type="button"
                class="btn btn-sm btn-outline-info"
                @click="updateResultsPublished($event)"
            >
                Save
            </button>
        </p>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'DateInfo',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        contestStart: {
            type: String,
            default: null,
        },
        judgingStart: {
            type: String,
            default: null,
        },
        resultsPublished: {
            type: String,
            default: null,
        },
    },
    data () {
        return {
            newContestStart: null,
            newJudgingStart: null,
            newResultsPublished: null,
        };
    },
    methods: {
        async updateContestStart(e): Promise<void> {
            const contestStart = await this.executePost(`/admin/contests/${this.contestId}/contests/updateContestStart`, { date: this.newContestStart }, e);

            if (!this.isError(contestStart)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated contest start date`,
                    type: 'info',
                });
                this.$store.commit('updateContestStart', {
                    contestId: this.contestId,
                    contestStart,
                });
            }
        },
        async updateJudgingStart(e): Promise<void> {
            const judgingStart = await this.executePost(`/admin/contests/${this.contestId}/contests/updateJudgingStart`, { date: this.newJudgingStart }, e);

            if (!this.isError(judgingStart)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated judging start date`,
                    type: 'info',
                });
                this.$store.commit('updateJudgingStart', {
                    contestId: this.contestId,
                    judgingStart,
                });
            }
        },
        async updateResultsPublished(e): Promise<void> {
            const resultsPublished = await this.executePost(`/admin/contests/${this.contestId}/contests/updateResultsPublished`, { date: this.newResultsPublished }, e);

            if (!this.isError(resultsPublished)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated results published date`,
                    type: 'info',
                });
                this.$store.commit('updateResultsPublished', {
                    contestId: this.contestId,
                    resultsPublished,
                });
            }
        },
    },
});
</script>

<style>

.date-input {
    width: 10%;
}

</style>