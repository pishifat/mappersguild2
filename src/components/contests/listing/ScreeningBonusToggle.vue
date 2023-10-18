<template>
    <div class="form-check mt-2">
        <input
            id="isContacted"
            :checked="screeningBonus"
            class="form-check-input"
            type="checkbox"
            @change="toggleScreeningBonus($event)"
        />
        <label class="form-check-label" for="isContacted">
            Screening bonus
        </label>
        <div class="small text-secondary">
            Adds +1 to every screener's votes, devalueing maps that are highly liked by few screeners. Only use this if your contest has a lot of screeners.
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ScreeningBonusToggle',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        screeningBonus: {
            type: Boolean,
            required: true,
        },
    },
    methods: {
        async toggleScreeningBonus(e): Promise<void> {
            const screeningBonus = await this.$http.executePost(`/contests/listing/${this.contestId}/toggleScreeningBonus`, {}, e);

            if (!this.$http.isError(screeningBonus)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Toggled screening bonus`,
                    type: 'info',
                });
                this.$store.commit('updateScreeningBonus', {
                    contestId: this.contestId,
                    screeningBonus,
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