<template>
    <div class="row">
        <div class="col-sm-6">
            <div class="form-inline w-100">
                Submissions open:
                <div class="input-group">
                    <input
                        v-model="newContestStart"
                        class="ml-1 form-control"
                        type="date"
                        @keyup.enter="updateContestStart($event)"
                    />
                    <div class="input-group-append">
                        <button
                            class="btn btn-primary"
                            href="#"
                            @click="updateContestStart($event)"
                        >
                            Save date
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="form-inline w-100">
                Submissions close:
                <div class="input-group">
                    <input
                        v-model="newContestEnd"
                        class="ml-1 form-control"
                        type="date"
                        @keyup.enter="updateContestEnd($event)"
                    />
                    <div class="input-group-append">
                        <button
                            class="btn btn-primary"
                            href="#"
                            @click="updateContestEnd($event)"
                        >
                            Save date
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
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
        contestEnd: {
            type: String,
            default: null,
        },
    },
    data () {
        return {
            newContestStart: this.contestStart,
            newContestEnd: this.contestEnd,
        };
    },
    watch: {
        contestId(): void {
            this.newContestStart = this.contestStart;
            this.newContestEnd = this.contestEnd;
        },
    },
    methods: {
        async updateContestStart(e): Promise<void> {
            const contestStart = await this.$http.executePost(`/contests/listing/${this.contestId}/updateContestStart`, { date: this.newContestStart }, e);

            if (!this.$http.isError(contestStart)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated contest start date`,
                    type: 'info',
                });
                this.$store.commit('updateContestStart', {
                    contestId: this.contestId,
                    contestStart,
                });
            } else {
                this.newContestStart = this.contestStart;
            }
        },
        async updateContestEnd(e): Promise<void> {
            const contestEnd = await this.$http.executePost(`/contests/listing/${this.contestId}/updateContestEnd`, { date: this.newContestEnd }, e);

            if (!this.$http.isError(contestEnd)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated contest end date`,
                    type: 'info',
                });
                this.$store.commit('updateContestEnd', {
                    contestId: this.contestId,
                    contestEnd,
                });
            } else {
                this.newContestEnd = this.contestEnd;
            }
        },
    },
});
</script>