<template>
    <div class="form-check mt-2">
        <input
            :checked="useRawScoring"
            class="form-check-input"
            type="checkbox"
            @change="toggleUseRawScoring($event)"
        />
        <label class="form-check-label" for="isContacted">
            Raw scoring only
        </label>
        <div class="small text-secondary">
            <div>Contests on Mappers' Guild use this formula standardize results:</div>
            <div class="ms-4"><code>judge X's final score = (judge X's raw score - judge X's average raw score) / judge X's standard deviation</code></div>
            <div>Checking this box will only display <b>raw judging scores</b> on the results page (and hide standardized scores).</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'UseRawScoringToggle',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        useRawScoring: {
            type: Boolean,
            required: true,
        },
    },
    methods: {
        async toggleUseRawScoring(e): Promise<void> {
            const useRawScoring = await this.$http.executePost(`/contests/listing/${this.contestId}/toggleUseRawScoring`, {}, e);

            if (!this.$http.isError(useRawScoring)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated contest scoring method`,
                    type: 'info',
                });
                this.$store.commit('updateUseRawScoring', {
                    contestId: this.contestId,
                    useRawScoring,
                });
            }
        },
    },
});
</script>

<style scoped>

.date-input {
    width: 10%;
}

</style>