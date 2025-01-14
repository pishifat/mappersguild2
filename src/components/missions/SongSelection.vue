<template>
    <div>
        <div v-if="deadlineReached">
            <b>Song:</b>
            <span v-if="songInfo" class="text-secondary ms-1">
                <b>{{ songInfo.song.artist }} - {{ songInfo.song.title }}</b>
                <div>When the artist for your song is announced, add your beatmap to the quest!</div>
                <div class="mt-3">Once all artists for this quest are announced, the quest will be closed and you'll earn points :)</div>
            </span>
            <span v-else class="text-secondary ms-1">
                <span>You're too late to pick a song. Sorry :(</span>
                <div class="mt-3">Once all artists for this quest are announced, the quest will be closed!</div>
            </span>
            <div class="mt-3 text-success">
                Pending artist announcements: <b>{{ mission.remainingArtists }}</b>
            </div>
        </div>
        <div v-else>
            <b v-if="!songInfo">Song:</b>
            <span v-if="!songInfoLoaded" class="text-secondary ms-1">...</span>
            <button
                v-else-if="!songInfo"
                class="btn btn-sm btn-outline-info ms-1"
                @click="findShowcaseMissionSong($event)"
            >
                Load song
            </button>
            <div v-else>
                <ul>
                    <li>
                        <a
                            v-if="songInfo.song.oszUrl"
                            :href="songInfo.song.oszUrl"
                            target="_blank"
                            class="me-1"
                        >
                            {{ songInfo.song.artist }} - {{ songInfo.song.title }}
                        </a>
                        <span v-else class="text-secondary ms-1">
                            <b>{{ songInfo.song.artist }} - {{ songInfo.song.title }}</b>
                            <span class="small ms-1">(ask <a href="https://osu.ppy.sh/users/3178418" target="_blank">pishifat</a> for the .osz)</span>
                        </span>
                        <button
                            v-bs-tooltip="`this only affects your 'Available Points'`"
                            class="btn btn-sm btn-outline-info"
                            @click="findShowcaseMissionSong($event)"
                        >
                            Re-select song for 35 points <i class="fas fa-coins" />
                        </button>
                    </li>
                </ul>

                <div class="text-secondary">
                    <div>Only <i>you</i> can see the song above. Treat it like confidential information. Do NOT tell anyone that it's related to Featured Artists or this quest!</div>
                    <div class="mt-2">Talk to <a href="https://osu.ppy.sh/users/3178418" target="_blank">pishifat</a> if you have any questions.</div>
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
    name: 'SongSelection',
    props: {
        mission: {
            type: Object as () => Mission,
            required: true,
        },
    },
    data () {
        return {
            songInfo: null as any,
            songInfoLoaded: false,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        deadlineReached() {
            return new Date() > new Date(this.mission.deadline);
        },
    },
    async mounted(): Promise<void> {
        this.songInfo = await this.$http.executeGet(`/missions/${this.mission.id}/findSelectedShowcaseMissionSong`);
        this.songInfoLoaded = true;
    },
    methods: {
        async findShowcaseMissionSong(e): Promise<void> {
            const result = confirm(`You will be randomly assigned a song from an unreleased Featured Artist. This is confidential information, so please do not spread it.\n\nYou are the only person who will have access to this song.\n\nAre you sure you want to continue?`);

            if (result) {
                const mission = await this.$http.executePost(`/missions/${this.mission.id}/findShowcaseMissionSong`, {}, e);

                if (!this.$http.isError(mission)) {
                    await this.loadSelectedSong();
                    this.$store.dispatch('updateToastMessages', {
                        message: `Song loaded`,
                        type: 'info',
                    });
                }
            }
        },
        async loadSelectedSong(): Promise<void> {
            this.songInfo = await this.$http.executeGet(`/missions/${this.mission.id}/findSelectedShowcaseMissionSong`);
            this.songInfoLoaded = true;
        },
    },
});
</script>