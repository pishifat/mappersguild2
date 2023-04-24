<template>
    <div>
        <a :href="'#' + artist.label.replace(/\s|[0-9]/g, '') + 'Artist'" data-bs-toggle="collapse" :class="!artist.hasRankedMaps ? 'text-warning' : ''">
            {{ artist.label }}
            <i class="fas fa-angle-down" />
        </a>
        —
        <span class="small">
            <user-link-list
                :users="artist.showcaseMappers"
            />
        </span>
        <a
            v-if="artist.showcaseMappers && isShowcaseMapper"
            href="#"
            class="text-danger small"
            :class="processing ? 'fake-button-disable' : ''"
            @click.prevent="removeShowcaseMapper($event)"
            >
            remove
        </a>
        <a
            v-else
            href="#"
            class="text-success small"
            :class="processing ? 'fake-button-disable' : ''"
            @click.prevent="addShowcaseMapper($event)"
            >
            add
        </a>
        <div :id="artist.label.replace(/\s|[0-9]/g, '') + 'Artist'" class="collapse">
            <div class="small ms-2">
                <div v-if="artist.referenceUrl">
                    <a v-if="artist.referenceUrl" :href="artist.referenceUrl" target="_blank">{{ artist.referenceUrl }}</a>
                </div>
                <div v-if="!artist.songs.length">
                    Songs haven't been added yet. @pishifat
                </div>
                <div v-else-if="artist.oszTemplatesUrl">
                    <a :href="artist.oszTemplatesUrl" target="_blank">.osz templates</a>
                </div>
                <div v-else>
                    .osz templates aren't available yet. :(
                </div>
                <div v-if="artist.projectedRelease">
                    {{ month }} (deadline estimate)
                </div>
                <div v-else>
                    Deadline hasn't been set yet.
                </div>
                <div v-if="artist.offeredUsers && artist.offeredUsers.length && loggedInUser.group == 'admin'">
                    offered to
                    <user-link-list
                        :users="artist.offeredUsers"
                    />
                </div>
            </div>
            <ul>
                <li v-for="song in artist.songs" :key="song.id" class="small text-secondary">
                    <song-details
                        :song="song"
                        :is-showcase-mapper="isShowcaseMapper"
                        :artist-id="artist.id"
                    />
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { FeaturedArtist } from '../../../interfaces/featuredArtist';
import UserLinkList from '@components/UserLinkList.vue';
import SongDetails from './SongDetails.vue';

export default defineComponent({
    name: 'ArtistDetails',
    components: {
        UserLinkList,
        SongDetails,
    },
    props: {
        artist: {
            type: Object as () => FeaturedArtist,
            default: null,
        },
    },
    data() {
        return {
            processing: false,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        isShowcaseMapper(): boolean {
            const showcaseMapperIds = this.artist.showcaseMappers.map(u => u.id);

            return showcaseMapperIds.includes(this.loggedInUser.id);
        },
        month(): string | null {
            if (this.artist.projectedRelease) {
                const date = new Date(this.artist.projectedRelease);

                return date.toLocaleString('default', { month: 'long' });
            }

            return null;
        },
    },
    methods: {
        async addShowcaseMapper(e): Promise<void> {
            this.processing = true;
            const artist: any = await this.$http.executePost('/showcase/addShowcaseMapper/' + this.artist.id, {}, e);

            if (artist && !this.$http.isError(artist)) {
                this.$store.commit('showcase/updateArtist', artist);
                this.$store.dispatch('updateToastMessages', {
                    message: `Added`,
                    type: 'info',
                });
            }

            this.processing = false;
        },
        async removeShowcaseMapper(e): Promise<void> {
            this.processing = true;
            const artist: any = await this.$http.executePost('/showcase/removeShowcaseMapper/' + this.artist.id, {}, e);

            if (artist && !this.$http.isError(artist)) {
                this.$store.commit('showcase/updateArtist', artist);
                this.$store.dispatch('updateToastMessages', {
                    message: `Removed`,
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