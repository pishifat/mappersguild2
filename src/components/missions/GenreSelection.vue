<template>
    <div>
        <b>Song selection:</b>
        <div v-if="deadlineReached">
            <span v-if="genreSongsInfo" class="text-secondary ms-1">
                <div v-for="song in genreSongsInfo.songs" :key="song.id">
                    <b>{{ song.artist }} - {{ song.title }}</b>
                </div>
                <div class="mt-2">When your song's artist is announced, you can add your beatmap to this quest!</div>
                <div class="mt-3">Once all artists for this quest are announced, the quest will be closed and you'll earn points :)</div>
            </span>
            <span v-else class="text-secondary ms-1">
                <span>You're too late to pick songs. Sorry :(</span>
                <div class="mt-3">Once all artists for this quest are announced, the quest will be closed!</div>
            </span>
            <div class="mt-3 text-success">
                Pending artist announcements: <b>{{ mission.remainingArtists }}</b>
            </div>
        </div>
        <div v-else>
            <i v-if="!genreSongsInfoLoaded" class="text-secondary ms-1">Loading...</i>
            <div v-else>
                <div class="mt-2 d-flex align-items-center gap-2">
                    Song type: <select v-model="selectedTag" class="form-select form-select-sm w-50">
                        <option value="" disabled>
                            Select a category
                        </option>
                        <option v-for="option in (mission.genreOptions || [])" :key="option" :value="option">
                            {{ option.charAt(0).toUpperCase() + option.slice(1) }}
                        </option>
                    </select>
                    <button
                        v-if="!genreSongsInfo"
                        v-bs-tooltip="'This will randomly select 3 songs in the category you select'"
                        class="btn btn-sm btn-outline-info"
                        :disabled="!selectedTag"
                        @click="findShowcaseMissionSongByTag($event)"
                    >
                        Load 3 songs
                    </button>
                </div>
                <ol v-if="genreSongsInfo">
                    <li v-for="(song, index) in genreSongsInfo.songs" :key="song.id" class="mt-1">
                        <a
                            v-if="song.oszUrl"
                            :href="song.oszUrl"
                            target="_blank"
                            class="me-1"
                        >
                            {{ song.artist }} - {{ song.title }}
                        </a>
                        <span v-else class="text-secondary">
                            <b>{{ song.artist }} - {{ song.title }}</b>
                            <span class="small ms-1">(ask <a href="https://osu.ppy.sh/users/3178418" target="_blank">pishifat</a> for the .osz)</span>
                        </span>
                        <button
                            v-bs-tooltip="canAffordReroll ? `this only affects your 'Available Points'` : `you don't have enough Available Points for this`"
                            class="btn btn-sm ms-1"
                            :class="canAffordReroll ? 'btn-outline-info' : 'btn-outline-danger'"
                            :disabled="!selectedTag || !canAffordReroll || rerolling"
                            @click="findShowcaseMissionSongByTag($event, index)"
                        >
                            Re-select <i v-if="selectedTag">{{ selectedTag }}</i> song for {{ rerollCost }} {{ rerollCost === 1 ? 'point' : 'points' }} <i class="fas fa-coins" />
                        </button>
                    </li>
                </ol>

                <div v-if="genreSongsInfo" class="mt-2 mb-4 small" :class="canAffordReroll ? 'text-secondary' : 'text-warning'">
                    Your available points: <b>{{ availablePoints }}</b>
                </div>
                <div v-if="genreSongsInfo" class="text-secondary">
                    <div>Only <i>you</i> can see the songs above. Treat them like confidential information. Do NOT tell anyone that they're related to Featured Artists or this quest!</div>
                    <div class="mt-2">
                        Once the artist you map is announced, you can add your map to this quest and earn points :)
                    </div>
                    <div class="mt-2">
                        Talk to <a href="https://osu.ppy.sh/users/3178418" target="_blank">pishifat</a> if you have any questions.
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

export default defineComponent({
    name: 'GenreSelection',
    props: {
        mission: {
            type: Object as () => Mission,
            required: true,
        },
    },
    data () {
        return {
            genreSongsInfo: null as any,
            genreSongsInfoLoaded: false,
            selectedTag: '',
            rerollCount: 0,
            rerolling: false,
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
            return Math.pow(2, this.rerollCount);
        },
        availablePoints() {
            return this.loggedInUser ? this.loggedInUser.availablePoints : 0;
        },
        canAffordReroll() {
            return this.availablePoints >= this.rerollCost;
        },
    },
    watch: {
        async availablePoints(): Promise<void> {
            const rerollCount = await this.$http.executeGet(`/missions/${this.mission.id}/getGenreSongRerollCount`);
            this.rerollCount = typeof rerollCount === 'number' ? rerollCount : 0;
        },
    },
    async mounted(): Promise<void> {
        const [songsInfo, rerollCount] = await Promise.all([
            this.$http.executeGet(`/missions/${this.mission.id}/findSelectedShowcaseMissionSongsByTag`),
            this.$http.executeGet(`/missions/${this.mission.id}/getGenreSongRerollCount`),
        ]);

        if (!this.$http.isError(songsInfo)) {
            this.genreSongsInfo = songsInfo;
        }

        this.rerollCount = typeof rerollCount === 'number' ? rerollCount : 0;
        this.genreSongsInfoLoaded = true;
    },
    methods: {
        async findShowcaseMissionSongByTag(e, songIndex?: number): Promise<void> {
            const isReroll = songIndex !== undefined;

            if (!isReroll && !this.selectedTag) {
                this.$store.dispatch('updateToastMessages', { message: 'Select a category first', type: 'danger' });

                return;
            }

            const confirmMessage = isReroll
                ? `You will be randomly assigned a new song for ${this.rerollCost} ${this.rerollCost === 1 ? 'point' : 'points'}.\n\nThis is confidential information, so please do not spread it.\n\nAre you sure you want to continue?`
                : `You will be randomly assigned 3 songs from the "${this.selectedTag}" category. These are unreleased Featured Artist songs.\n\nThis is confidential information, so please do not spread it.\n\nAre you sure you want to continue?`;

            const result = confirm(confirmMessage);

            if (result) {
                const body = isReroll ? { songIndex, tag: this.selectedTag } : { tag: this.selectedTag };
                this.rerolling = true;
                const entry: any = await this.$http.executePost(`/missions/${this.mission.id}/findShowcaseMissionSongByTag`, body, e);
                this.rerolling = false;

                if (!this.$http.isError(entry)) {
                    if (isReroll) {
                        this.$store.commit('setAvailablePoints', entry.availablePoints);
                        this.rerollCount++;
                    }

                    await this.loadSelectedSongs();
                    this.$store.dispatch('updateToastMessages', {
                        message: isReroll ? `Song rerolled` : `Songs loaded`,
                        type: 'info',
                    });
                }
            }
        },
        async loadSelectedSongs(): Promise<void> {
            this.genreSongsInfoLoaded = false;
            this.genreSongsInfo = await this.$http.executeGet(`/missions/${this.mission.id}/findSelectedShowcaseMissionSongsByTag`);
            this.genreSongsInfoLoaded = true;
        },
    },
});
</script>
