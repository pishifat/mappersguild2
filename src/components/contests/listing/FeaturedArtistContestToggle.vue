<template>
    <div class="form-check mt-2">
        <input
            id="isContacted"
            :checked="isFeaturedArtistContest"
            class="form-check-input"
            type="checkbox"
            @change="toggleIsFeaturedArtistContest($event)"
        />
        <label class="form-check-label" for="isContacted">
            Featured Artist Contest
        </label>
        <div class="small text-secondary">
            Contests using exclusively Featured Artist songs are eligible for <a href="/faq#rewards" target="_blank">Mappers' Guild points</a>:
            <ul>
                <li>
                    Contest organizer: 5 points
                </li>
                <li>
                    Contest participant: 3 points
                </li>
                <li>
                    Contest screener/judge: 1 point
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'FeaturedArtistContestToggle',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        isFeaturedArtistContest: {
            type: Boolean,
            required: true,
        },
    },
    methods: {
        async toggleIsFeaturedArtistContest(e): Promise<void> {
            const isFeaturedArtistContest = await this.$http.executePost(`/contests/listing/${this.contestId}/toggleIsFeaturedArtistContest`, {}, e);

            if (!this.$http.isError(isFeaturedArtistContest)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated contest Featured Artist status`,
                    type: 'info',
                });
                this.$store.commit('updateIsFeaturedArtistContest', {
                    contestId: this.contestId,
                    isFeaturedArtistContest,
                });
            }
        },
    },
});
</script>