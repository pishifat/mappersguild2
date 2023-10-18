<template>
    <div class="row">
        <div class="input-group col-sm-4">
            <input
                v-model.number="newJudgingThreshold"
                class="form-control form-control-sm"
                autocomplete="off"
                type="number"
                placeholder="judging threshold"
                @keyup.enter="updateJudgingThreshold($event)"
            />
            <div class="input-group-append">
                <button
                    class="btn btn-primary"
                    href="#"
                    @click.prevent="updateJudgingThreshold($event)"
                >
                    save <i class="fa-star fas small" />
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'JudgingThreshold',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        judgingThreshold: {
            type: Number,
            default: 0,
        },
    },
    data () {
        return {
            newJudgingThreshold: this.judgingThreshold,
        };
    },
    watch: {
        contestId(): void {
            this.newJudgingThreshold = this.judgingThreshold;
        },
    },
    methods: {
        async updateJudgingThreshold(e): Promise<void> {
            const judgingThreshold = await this.$http.executePost(`/contests/listing/${this.contestId}/updateJudgingThreshold`, { judgingThreshold: this.newJudgingThreshold }, e);

            if (!this.$http.isError(judgingThreshold)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated judging threshold to ${judgingThreshold}`,
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
