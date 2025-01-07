<template>
    <div class="form-check mt-2">
        <input
            id="isContacted"
            :checked="hasPublicJudges"
            class="form-check-input"
            type="checkbox"
            @change="toggleHasPublicJudges($event)"
        />
        <label class="form-check-label" for="isContacted">
            Public judge usernames
        </label>
        <div class="small text-secondary">
            Check this to publicly display judge usernames on the results page. Judges may receive harassment depending on their input, so use this setting with caution.
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'PublicJudgesToggle',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        hasPublicJudges: {
            type: Boolean,
            required: true,
        },
    },
    methods: {
        async toggleHasPublicJudges(e): Promise<void> {
            const hasPublicJudges = await this.$http.executePost(`/contests/listing/${this.contestId}/toggleHasPublicJudges`, {}, e);

            if (!this.$http.isError(hasPublicJudges)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated contest hasPublicJudges`,
                    type: 'info',
                });
                this.$store.commit('updateHasPublicJudges', {
                    contestId: this.contestId,
                    hasPublicJudges,
                });
            }
        },
    },
});
</script>