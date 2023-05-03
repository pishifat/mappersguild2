<template>
    <div>
        <div class="container card card-body py-1 mb-4">
            <div class="row mx-3 mt-2">
                <button
                    class="btn btn-sm btn-info w-100 mb-1"
                    @click="loadActionBeatmaps($event)"
                >
                    Load beatmaps
                </button>
            </div>
            <div class="row">
                <div class="col">
                    <h5 class="ms-4 mt-2">
                        <a href="#actionBeatmaps" data-bs-toggle="collapse">
                            Beatmaps
                            <i class="fas fa-angle-down" />
                        </a>
                        <span
                            v-if="actionBeatmapsLoading"
                            class="ms-2 small text-white-50"
                            >loading...</span>
                    </h5>
                    <div id="actionBeatmaps" class="show">
                        <table
                            v-if="actionBeatmaps.length"
                            class="table table-sm"
                        >
                            <thead>
                                <tr>
                                    <th scope="col">
                                        METADATA
                                    </th>
                                    <th scope="col">
                                        PACK ID
                                    </th>
                                    <th scope="col">
                                        STATUS
                                    </th>
                                    <th scope="col">
                                        EDIT
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="beatmap in actionBeatmaps"
                                    :key="beatmap.id"
                                    class="text-white-50"
                                >
                                    <td scope="row">
                                        <modes-icons :modes="[beatmap.mode]" />
                                        <a
                                            v-if="beatmap.url"
                                            :href="beatmap.url"
                                            class="ms-1"
                                        >
                                            {{ generateMetadata(beatmap.song) }}
                                        </a>
                                        <span v-else class="ms-1">{{
                                            generateMetadata(beatmap.song)
                                        }}</span>
                                    </td>
                                    <td scope="row">
                                        {{ beatmap.packId }}
                                    </td>
                                    <td scope="row">
                                        {{ beatmap.status }}
                                    </td>
                                    <td scope="row">
                                        <a
                                            href="#"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editBeatmap"
                                            @click.prevent="
                                                $store.commit(
                                                    'setSelectedBeatmap',
                                                    beatmap
                                                )
                                            "
                                        >
                                            edit
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <span
                            v-else-if="!actionBeatmapsLoading"
                            class="text-white-50 ms-5"
                            >None...</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="container card card-body py-1 mb-4">
            <div class="row mx-3 mt-2">
                <button
                    class="btn btn-sm btn-info w-100 mb-1"
                    @click="loadActionQuests($event)"
                >
                    Load quests
                </button>
            </div>
            <div class="row">
                <div class="col">
                    <h5 class="ms-4 mt-2">
                        <a href="#actionQuests" data-bs-toggle="collapse">
                            Quests
                            <i class="fas fa-angle-down" />
                        </a>
                        <span
                            v-if="actionQuestsLoading"
                            class="ms-2 small text-white-50"
                            >loading...</span>
                    </h5>
                    <div id="actionQuests" class="show">
                        <table
                            v-if="actionQuests.length"
                            class="table table-sm"
                        >
                            <thead>
                                <tr>
                                    <th scope="col">
                                        NAME
                                    </th>
                                    <th scope="col">
                                        CREATOR
                                    </th>
                                    <th scope="col">
                                        MODES
                                    </th>
                                    <th scope="col">
                                        STATUS
                                    </th>
                                    <th scope="col">
                                        MAPSETS
                                    </th>
                                    <th scope="col">
                                        EDIT
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="quest in actionQuests"
                                    :key="quest.id"
                                    class="text-white-50"
                                >
                                    <td scope="row">
                                        {{ quest.name }}
                                    </td>
                                    <td scope="row">
                                        {{ quest.creator.username }}
                                    </td>
                                    <td scope="row">
                                        <modes-icons :modes="quest.modes" />
                                    </td>
                                    <td scope="row">
                                        {{ quest.status }}
                                    </td>
                                    <td scope="row">
                                        {{ quest.requiredMapsets }}
                                    </td>
                                    <td scope="row">
                                        <a
                                            href="#"
                                            data-bs-toggle="modal"
                                            :data-bs-target="
                                                quest.status == 'pending'
                                                    ? '#reviewQuest'
                                                    : '#editQuest'
                                            "
                                            @click.prevent="
                                                $store.commit(
                                                    'setSelectedQuest',
                                                    quest
                                                )
                                            "
                                        >
                                            edit
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <span
                            v-else-if="!actionQuestsLoading"
                            class="text-white-50 ms-5"
                            >None...</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="container card card-body py-1 mb-4">
            <div class="row mx-3 mt-2">
                <button
                    class="btn btn-sm btn-info w-100 mb-1"
                    @click="loadActionUsers($event)"
                >
                    Load users
                </button>
            </div>
            <div class="row">
                <div class="col">
                    <h5 class="ms-4 mt-2">
                        <a href="#actionUsers" data-bs-toggle="collapse">
                            Users
                            <i class="fas fa-angle-down" />
                        </a>
                        <span
                            v-if="actionUsersLoading"
                            class="ms-2 small text-white-50"
                            >loading...</span>
                    </h5>
                    <div v-if="actionUsers" id="actionUsers" class="show">
                        <table v-if="actionUsers.length" class="table table-sm">
                            <thead>
                                <tr>
                                    <th scope="col">
                                        USERNAME
                                    </th>
                                    <th scope="col">
                                        RANK
                                    </th>
                                    <th scope="col">
                                        QUEUED BADGE
                                    </th>
                                    <th scope="col">
                                        BADGE
                                    </th>
                                    <th scope="col">
                                        EDIT
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="user in actionUsers"
                                    :key="user.id"
                                    class="text-white-50"
                                >
                                    <td scope="row">
                                        <user-link :user="user" />
                                    </td>
                                    <td scope="row">
                                        <i
                                            v-if="user.rank"
                                            v-bs-tooltip="
                                                `rank ${user.rank} user`
                                            "
                                            class="fas fa-crown"
                                            :class="'text-rank-' + user.rank"
                                        />
                                    </td>
                                    <td
                                        scope="row"
                                        :class="{
                                            'bg-open':
                                                user.rank != user.queuedBadge,
                                        }"
                                    >
                                        <i
                                            v-if="user.queuedBadge"
                                            v-bs-tooltip="
                                                `rank ${user.queuedBadge} user`
                                            "
                                            class="fas fa-crown"
                                            :class="
                                                'text-rank-' + user.queuedBadge
                                            "
                                        />
                                    </td>
                                    <td
                                        scope="row"
                                        :class="{
                                            'bg-open': user.rank != user.badge,
                                        }"
                                    >
                                        <i
                                            v-if="user.badge"
                                            v-bs-tooltip="
                                                `rank ${user.badge} user`
                                            "
                                            class="fas fa-crown"
                                            :class="'text-rank-' + user.badge"
                                        />
                                    </td>
                                    <td scope="row">
                                        <a
                                            href="#"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editUser"
                                            @click.prevent="
                                                $store.commit(
                                                    'setSelectedUser',
                                                    user
                                                )
                                            "
                                        >
                                            edit
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <span
                            v-else-if="!actionUsersLoading"
                            class="text-white-50 ms-5"
                            >None...</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="container card card-body py-1 mb-4">
            <div class="row mx-3 mt-2">
                <button
                    class="btn btn-sm btn-info w-100 mb-1"
                    @click="loadActionContests($event)"
                >
                    Load contests
                </button>
            </div>
            <div class="row">
                <div class="col">
                    <h5 class="ms-4 mt-2">
                        <a href="#actionContests" data-bs-toggle="collapse">
                            Contests
                            <i class="fas fa-angle-down" />
                        </a>
                        <span
                            v-if="actionContestsLoading"
                            class="ms-2 small text-white-50"
                            >loading...</span>
                    </h5>
                    <div v-if="actionContests" id="actionContests" class="show">
                        <table
                            v-if="actionContests.length"
                            class="table table-sm"
                        >
                            <thead>
                                <tr>
                                    <th scope="col">
                                        CONTEST
                                    </th>
                                    <th scope="col">
                                        CREATOR
                                    </th>
                                    <th scope="col">
                                        EDIT
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="contest in actionContests"
                                    :key="contest.id"
                                    class="text-white-50"
                                >
                                    <td scope="row">
                                        <a
                                            :href="
                                                '/contests/listing?contest=' +
                                                contest.id
                                            "
                                            >{{ contest.name }}</a>
                                    </td>
                                    <td scope="row">
                                        <user-link-list :users="contest.creators" />
                                    </td>
                                    <td scope="row">
                                        <a
                                            href="#"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editContest"
                                            @click.prevent="
                                                $store.commit(
                                                    'setSelectedContest',
                                                    contest
                                                )
                                            "
                                        >
                                            edit
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <span
                            v-else-if="!actionContestsLoading"
                            class="text-white-50 ms-5"
                            >None...
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="container card card-body py-1">
            <div class="row mx-3 mt-2">
                <button
                    class="btn btn-sm btn-info w-100 mb-1"
                    @click="loadActionArtists($event)"
                >
                    Load artists
                </button>
            </div>
            <div class="row">
                <div class="col-sm-6">
                    <h5 class="ms-4 mt-2">
                        <a href="#actionArtists" data-bs-toggle="collapse">
                            Artists
                            <i class="fas fa-angle-down" />
                        </a>
                        <span
                            v-if="actionArtistsLoading"
                            class="ms-2 small text-white-50"
                            >loading...</span>
                    </h5>
                    <div v-if="actionArtists" id="actionArtists" class="show">
                        <table
                            v-if="actionArtists.length"
                            class="table table-sm"
                        >
                            <thead>
                                <tr>
                                    <th scope="col">
                                        ARTIST
                                    </th>
                                    <th scope="col">
                                        COMMENT
                                    </th>
                                    <th scope="col">
                                        EDIT
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="artist in actionArtists"
                                    :key="artist.id"
                                    class="text-white-50"
                                >
                                    <td scope="row">
                                        <a
                                            :href="findArtistBeatmapSearchUrl(artist.label)"
                                            target="_blank"
                                        >
                                            {{ artist.label }}
                                        </a>
                                        <a class="ms-2" href="#" @click.prevent="artistInput = artist.label">
                                            <i class="fa fa-arrow-right" />
                                        </a>
                                        <a class="ms-2" href="#" @click.prevent="dismissArtist(artist.id, $event)">
                                            <i class="fas fa-times" />
                                        </a>
                                        <a class="ms-2 text-danger" href="#" @click.prevent="permanentlyDismissArtist(artist.id, $event)">
                                            <i class="fas fa-times" />
                                        </a>
                                    </td>
                                    <td scope="row" class="small">
                                        {{ artist.reviewComment }}
                                    </td>
                                    <td scope="row">
                                        <a
                                            href="#"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editFeaturedArtist"
                                            @click.prevent="
                                                $store.commit(
                                                    'setSelectedArtist',
                                                    artist
                                                )
                                            "
                                        >
                                            edit
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <span
                            v-else-if="!actionArtistsLoading"
                            class="text-white-50 ms-5"
                            >None...
                        </span>
                    </div>
                </div>
                <artist-search
                    class="mb-2 col-sm-6"
                    :input="artistInput"
                />
            </div>
        </div>

        <div class="radial-divisor" />

        <beatmap-info-admin v-if="selectedBeatmap" :beatmap="selectedBeatmap" />

        <quest-info v-if="selectedQuest" :quest="selectedQuest" />

        <review-quest v-if="selectedQuest" :quest="selectedQuest" />

        <user-info v-if="selectedUser" :user="selectedUser" />

        <contest-info v-if="selectedContest" :contest="selectedContest" />

        <featured-artist-info v-if="selectedArtist" :featured-artist="selectedArtist" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import BeatmapInfoAdmin from '../components/admin/BeatmapInfoAdmin.vue';
import QuestInfo from '../components/admin/quests/QuestInfo.vue';
import ReviewQuest from '../components/admin/quests/ReviewQuest.vue';
import UserInfo from '../components/admin/UserInfo.vue';
import ContestInfo from '../components/admin/ContestInfo.vue';
import FeaturedArtistInfo from '../components/admin/FeaturedArtistInfo.vue';
import { Beatmap } from '@interfaces/beatmap/beatmap';
import { Quest } from '@interfaces/quest';
import { User } from '@interfaces/user';
import adminModule from '@store/admin';
import ModesIcons from '@components/ModesIcons.vue';
import UserLinkList from '@components/UserLinkList.vue';
import ArtistSearch from '@components/artists/ArtistSearch.vue';

export default defineComponent({
    name: 'AdminPage',
    components: {
        BeatmapInfoAdmin,
        QuestInfo,
        ReviewQuest,
        UserInfo,
        ContestInfo,
        ModesIcons,
        UserLinkList,
        ArtistSearch,
        FeaturedArtistInfo,
    },
    data () {
        return {
            artistInput: '',
        };
    },
    computed: mapState({
        actionBeatmaps: (state: any) => state.admin.actionBeatmaps,
        actionBeatmapsLoading: (state: any) => state.admin.actionBeatmapsLoading,
        actionQuests: (state: any) => state.admin.actionQuests,
        actionQuestsLoading: (state: any) => state.admin.actionQuestsLoading,
        actionUsers: (state: any) => state.admin.actionUsers,
        actionUsersLoading: (state: any) => state.admin.actionUsersLoading,
        actionContests: (state: any) => state.admin.actionContests,
        actionContestsLoading: (state: any) => state.admin.actionContestsLoading,
        actionArtists: (state: any) => state.admin.actionArtists,
        actionArtistsLoading: (state: any) => state.admin.actionArtistsLoading,
        selectedBeatmap: (state: any) => state.admin.selectedBeatmap,
        selectedQuest: (state: any) => state.admin.selectedQuest,
        selectedUser: (state: any) => state.admin.selectedUser,
        selectedContest: (state: any) => state.admin.selectedContest,
        selectedArtist: (state: any) => state.admin.selectedArtist,
    }),
    beforeCreate() {
        if (!this.$store.hasModule('admin')) {
            this.$store.registerModule('admin', adminModule);
        }
    },
    unmounted() {
        if (this.$store.hasModule('admin')) {
            this.$store.unregisterModule('admin');
        }
    },
    methods: {
        generateMetadata(song): string {
            let metadata = song.artist + ' - ';

            if (song.title.length > 40) {
                metadata += song.title.slice(0, 40) + '...';
            } else {
                metadata += song.title;
            }

            return metadata;
        },
        async loadActionBeatmaps(e): Promise<void> {
            let result = true;

            if (result) {
                this.$store.commit('setActionBeatmaps', []);
                this.$store.commit('setActionBeatmapsLoading', true);
                const actionBeatmaps = await this.$http.executeGet<Beatmap[]>(
                    `/admin/loadActionBeatmaps`,
                    e
                );

                if (!this.$http.isError(actionBeatmaps)) {
                    this.$store.commit('setActionBeatmaps', actionBeatmaps);
                }

                this.$store.commit('setActionBeatmapsLoading', false);
            }
        },
        async loadActionQuests(e): Promise<void> {
            this.$store.commit('setActionQuests', []);
            this.$store.commit('setActionQuestsLoading', true);
            const actionQuests = await this.$http.executeGet<Quest[]>(
                '/admin/loadActionQuests',
                e
            );

            if (!this.$http.isError(actionQuests)) {
                this.$store.commit('setActionQuests', actionQuests);
            }

            this.$store.commit('setActionQuestsLoading', false);
        },
        async loadActionUsers(e): Promise<void> {
            this.$store.commit('setActionUsers', []);
            this.$store.commit('setActionUsersLoading', true);
            const actionUsers = await this.$http.executeGet<User[]>(
                '/admin/loadActionUsers',
                e
            );

            if (!this.$http.isError(actionUsers)) {
                this.$store.commit('setActionUsers', actionUsers);
            }

            this.$store.commit('setActionUsersLoading', false);
        },
        async loadActionContests(e): Promise<void> {
            this.$store.commit('setActionContests', []);
            this.$store.commit('setActionContestsLoading', true);
            const actionContests = await this.$http.executeGet<User[]>(
                '/admin/loadActionContests',
                e
            );

            if (!this.$http.isError(actionContests)) {
                this.$store.commit('setActionContests', actionContests);
            }

            this.$store.commit('setActionContestsLoading', false);
        },
        async loadActionArtists(e): Promise<void> {
            this.$store.commit('setActionArtists', []);
            this.$store.commit('setActionArtistsLoading', true);
            const actionArtists = await this.$http.executeGet<User[]>(
                '/admin/loadActionArtists',
                e
            );

            if (!this.$http.isError(actionArtists)) {
                this.$store.commit('setActionArtists', actionArtists);
            }

            this.$store.commit('setActionArtistsLoading', false);
        },
        findArtistBeatmapSearchUrl(artistName): string {
            return `https://osu.ppy.sh/beatmapsets?q=artist%3D"${artistName}"&s=any&sort=plays_desc`;
        },
        async dismissArtist(artistId, e): Promise<void> {
            const lastReviewed = await this.$http.executePost(`/admin/featuredArtists/${artistId}/updateLastReviewed`, {}, e);

            if (!this.$http.isError(lastReviewed)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated last reviewed`,
                    type: 'info',
                });
                this.$store.commit('removeFromActionArtists', {
                    featuredArtistId: artistId,
                });
            }
        },
        async permanentlyDismissArtist(artistId, e): Promise<void> {
            const permanentlyDismiss = await this.$http.executePost(`/admin/featuredArtists/${artistId}/togglePermanentlyDismiss`, {}, e);

            if (!this.$http.isError(permanentlyDismiss)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `updated permanenlty dismiss: ${permanentlyDismiss}`,
                    type: 'info',
                });
                this.$store.commit('removeFromActionArtists', {
                    featuredArtistId: artistId,
                });
            }
        },
    },
});
</script>
