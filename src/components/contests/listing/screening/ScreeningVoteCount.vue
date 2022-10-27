<template>
    <div class="row">
        <div class="input-group col-sm-4">
            <input
                v-model.number="newScreeningVoteCount"
                class="form-control form-control-sm"
                autocomplete="off"
                type="number"
                placeholder="screening vote count"
                @keyup.enter="updateScreeningVoteCount($event)"
            />
            <div class="input-group-append">
                <button
                    class="btn btn-primary"
                    href="#"
                    @click.prevent="updateScreeningVoteCount($event)"
                >
                    save
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ScreeningVoteCount',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        screeningVoteCount: {
            type: Number,
            default: 0,
        },
    },
    data () {
        return {
            newScreeningVoteCount: this.screeningVoteCount,
        };
    },
    watch: {
        contestId(): void {
            this.newScreeningVoteCount = this.screeningVoteCount;
        },
    },
    methods: {
        async updateScreeningVoteCount(e): Promise<void> {
            const screeningVoteCount = await this.$http.executePost(`/contests/listing/${this.contestId}/updateScreeningVoteCount`, { screeningVoteCount: this.newScreeningVoteCount }, e);

            if (!this.$http.isError(screeningVoteCount)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated screening vote count to ${screeningVoteCount}`,
                    type: 'info',
                });
                this.$store.commit('updateScreeningVoteCount', {
                    contestId: this.contestId,
                    screeningVoteCount,
                });
            }
        },
    },
});
</script>
