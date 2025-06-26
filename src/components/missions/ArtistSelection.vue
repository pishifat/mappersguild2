<template>
    <div>
        <div v-if="deadlineReached">
            <b>Artist: </b>
            <span v-if="artistInfo" class="text-secondary ms-1">
                <!-- artist info -->
                <div>When the artist is announced, add your beatmap to the quest!</div>
                <div class="mt-3">Once all artists for this quest are announced, the quest will be closed and you'll earn points :)</div>
            </span>
            <span v-else class="text-secondary ms-1">
                <span>You're too late to pick an artist. Sorry :(</span>
                <div class="mt-3">Once all artists for this quest are announced, the quest will be closed!</div>
            </span>
            <div class="mt-3 text-success">
                Pending artist announcements: <b>{{ mission.remainingArtists }}</b>
            </div>
        </div>
        <div v-else>
            <b v-if="!artistInfo">Artist:</b>
            <span v-if="!artistInfoLoaded" class="text-secondary ms-1">...</span>
            <button
                v-else-if="!artistInfo"
                class="btn btn-sm btn-outline-info ms-1"
                @click="findShowcaseMissionArtist($event)"
            >
                Load artist
            </button>
            <div v-else>
                <div class="mb-2">
                    <b>Artist: {{ artistInfo.artist.label }}</b>
                    <button
                        v-bs-tooltip="canAffordReroll ? `this only affects your 'Available Points'` : `you don't have enough Available Points for this`"
                        class="btn btn-sm ms-2"
                        :class="canAffordReroll ? 'btn-outline-info' : 'btn-outline-danger'"
                        :disabled="!canAffordReroll"
                        @click="findShowcaseMissionArtist($event)"
                    >
                        Re-select artist for {{ rerollCost }} points <i class="fas fa-coins" />
                    </button>
                </div>

                <artist-songs
                    :artist="artistInfo.artist"
                    @update-mission="loadSelectedArtist()"
                />

                <div class="text-secondary">
                    <div>
                        Only a few mappers can see the artist + songs above. <span class="text-success">Select</span> any song that you want to map for this quest, or work with another mapper who selected a song you like!
                    </div>
                    <div class="mt-2">
                        This is confidential information. Do NOT tell anyone that this artist is related to osu!'s Featured Artists or this quest! Talk to <a href="https://osu.ppy.sh/users/3178418" target="_blank">pishifat</a> if you have any questions.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Mission } from '@interfaces/mission';
import ArtistSongs from './ArtistSongs.vue';

export default defineComponent({
    name: 'SongSelection',
    components: {
        ArtistSongs,
    },
    props: {
        mission: {
            type: Object as () => Mission,
            required: true,
        },
    },
    data () {
        return {
            artistInfo: null as any,
            artistInfoLoaded: false,
            artistRerollCount: 0,
            sessionSpentPoints: 0,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        deadlineReached() {
            return new Date() > new Date(this.mission.deadline);
        },
        rerollCost() {
            return 10 * Math.pow(2, this.artistRerollCount);
        },
        effectiveAvailablePoints() {
            return this.loggedInUser ? this.loggedInUser.availablePoints - this.sessionSpentPoints : 0;
        },
        canAffordReroll() {
            return this.effectiveAvailablePoints >= this.rerollCost;
        },
    },
    async mounted(): Promise<void> {
        const [artistInfo, rerollCount] = await Promise.all([
            this.$http.executeGet(`/missions/${this.mission.id}/findSelectedShowcaseMissionArtist`),
            this.$http.executeGet(`/missions/${this.mission.id}/getArtistRerollCount`),
        ]);

        this.artistInfo = artistInfo;
        this.artistRerollCount = rerollCount || 0;
        this.artistInfoLoaded = true;
    },
    methods: {
        async findShowcaseMissionArtist(e): Promise<void> {
            const isReroll = this.artistInfo;
            const confirmMessage = isReroll
                ? `You will be randomly assigned a new unreleased Featured Artist for ${this.rerollCost} points.\n\nThis is confidential information, so please do not spread it.\n\nAre you sure you want to continue?`
                : `You will be randomly assigned an unreleased Featured Artist.\n\nThis is confidential information, so please do not spread it.\n\nAre you sure you want to continue?`;

            const result = confirm(confirmMessage);

            if (result) {
                const mission = await this.$http.executePost(`/missions/${this.mission.id}/findShowcaseMissionArtist`, {}, e);

                if (!this.$http.isError(mission)) {
                    if (isReroll) {
                        this.sessionSpentPoints += this.rerollCost;
                        this.artistRerollCount++;
                    }

                    await this.loadSelectedArtist();
                    this.$store.dispatch('updateToastMessages', {
                        message: isReroll ? `Artist rerolled` : `Artist loaded`,
                        type: 'info',
                    });
                }
            }
        },
        async loadSelectedArtist(): Promise<void> {
            this.artistInfoLoaded = false;
            this.artistInfo = await this.$http.executeGet(`/missions/${this.mission.id}/findSelectedShowcaseMissionArtist`);
            this.artistInfoLoaded = true;
        },
    },
});
</script>