<template>
    <div class="small">
        <a v-if="song.oszUrl" :href="song.oszUrl" target="_blank">{{ song.artist }} - {{ song.title }}</a>
        <span v-else>{{ song.artist }} - {{ song.title }}</span>
        <span v-if="song.songShowcaseMappers && song.songShowcaseMappers.length" class="text-secondary small">
            (potentially mapped by
            <user-link-list
                :users="song.songShowcaseMappers"
            />)
        </span>
        <span v-if="isShowcaseMapper" class="text-info">
            <a
                v-if="song.songShowcaseMappers && isSongShowcaseMapper"
                href="#"
                class="text-danger small"
                :class="processing ? 'fake-button-disable' : ''"
                @click.prevent="removeSongShowcaseMapper($event)"
            >
                remove
            </a>
            <a
                v-else
                href="#"
                class="text-success small"
                :class="processing ? 'fake-button-disable' : ''"
                @click.prevent="addSongShowcaseMapper($event)"
            >
                select
            </a>
        </span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { FeaturedSong } from '../../../interfaces/featuredSong';
import UserLinkList from '@components/UserLinkList.vue';

export default defineComponent({
    name: 'SongDetails',
    components: {
        UserLinkList,
    },
    props: {
        song: {
            type: Object as () => FeaturedSong,
            default: null,
        },
        isShowcaseMapper: {
            type: Boolean,
        },
        artistId: {
            type: String,
            required: true,
        },
        route: {
            type: String,
            default: 'showcase',
        },
    },
    emits: ['updateMission'],
    data() {
        return {
            processing: false,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        isSongShowcaseMapper(): boolean {
            const showcaseMapperIds = this.song.songShowcaseMappers.map(u => u.id);

            return showcaseMapperIds.includes(this.loggedInUser.id);
        },
    },
    methods: {
        async addSongShowcaseMapper(e): Promise<void> {
            this.processing = true;
            const artist: any = await this.$http.executePost(`/showcase/addSongShowcaseMapper/${this.artistId}/${this.song.id}`, {}, e);

            if (artist && !this.$http.isError(artist)) {
                if (this.route == 'showcase') {
                    this.$store.commit('showcase/updateArtist', artist);
                } else if (this.route == 'missions') {
                    this.$emit('updateMission');
                }

                this.$store.dispatch('updateToastMessages', {
                    message: `Selected!`,
                    type: 'info',
                });
            }

            this.processing = false;
        },
        async removeSongShowcaseMapper(e): Promise<void> {
            this.processing = true;
            const artist: any = await this.$http.executePost(`/showcase/removeSongShowcaseMapper/${this.artistId}/${this.song.id}`, {}, e);

            if (artist && !this.$http.isError(artist)) {
                if (this.route == 'showcase') {
                    this.$store.commit('showcase/updateArtist', artist);
                } else if (this.route == 'missions') {
                    this.$emit('updateMission');
                }

                this.$store.dispatch('updateToastMessages', {
                    message: `Removed!`,
                    type: 'info',
                });
            }

            this.processing = false;
        },
    },
});
</script>

<style scoped>
.fake-button-disable {
    pointer-events: none;
    opacity: 0.6;
}
</style>