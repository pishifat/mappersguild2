<template>
    <div>
        <div class="container bg-container py-1">
            <div class="row">
                <div class="col">
                    <h3 class="ml-2 mt-2">
                        Action Needed
                        <button class="btn btn-sm btn-outline-info" data-toggle="modal" data-target="#newsPost">
                            Create news post
                        </button>
                    </h3>
                    <h5 class="ml-4 mt-2">
                        <a href="#actionBeatmaps" data-toggle="collapse">
                            Beatmaps
                            <i class="fas fa-angle-down" />
                        </a>
                        <span v-if="actionBeatmapsLoading" class="ml-2 small text-white-50">loading...</span>
                    </h5>
                    <div id="actionBeatmaps" class="show">
                        <table v-if="actionBeatmaps.length" class="table table-sm table-dark table-hover">
                            <thead>
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
                            </thead>
                            <tbody>
                                <tr v-for="beatmap in actionBeatmaps" :key="beatmap.id" class="text-white-50">
                                    <td scope="row">
                                        <i v-if="beatmap.mode == 'osu'" class="fas fa-circle" />
                                        <i v-else-if="beatmap.mode == 'taiko'" class="fas fa-drum" />
                                        <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt" />
                                        <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream" />
                                        <a v-if="beatmap.url" :href="beatmap.url">
                                            {{ generateMetadata(beatmap.song) }}
                                        </a>
                                        <span v-else>{{ generateMetadata(beatmap.song) }}</span>
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
                                            data-toggle="modal"
                                            data-target="#editBeatmap"
                                            :data-id="beatmap.id"
                                            @click.prevent="selectedBeatmap = beatmap"
                                        >
                                            edit
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <span v-else-if="!actionBeatmapsLoading" class="text-white-50">None...</span>
                    </div>
                    <h5 class="ml-4 mt-2">
                        <a href="#actionQuests" data-toggle="collapse">
                            Quests
                            <i class="fas fa-angle-down" />
                        </a>
                        <span v-if="actionQuestsLoading" class="ml-2 small text-white-50">loading...</span>
                    </h5>
                    <div id="actionQuests" class="show">
                        <table v-if="actionQuests.length" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">
                                    NAME
                                </th>
                                <th scope="col">
                                    MODES
                                </th>
                                <th scope="col">
                                    STATUS
                                </th>
                                <th scope="col">
                                    EDIT
                                </th>
                            </thead>
                            <tbody>
                                <tr v-for="quest in actionQuests" :key="quest.id" class="text-white-50">
                                    <td scope="row">
                                        {{ quest.name }}
                                    </td>
                                    <td scope="row">
                                        <i v-if="quest.modes.includes('osu')" class="fas fa-circle" />
                                        <i v-if="quest.modes.includes('taiko')" class="fas fa-drum" />
                                        <i v-if="quest.modes.includes('catch')" class="fas fa-apple-alt" />
                                        <i v-if="quest.modes.includes('mania')" class="fas fa-stream" />
                                    </td>
                                    <td scope="row">
                                        {{ quest.status }}
                                    </td>
                                    <td scope="row">
                                        <a
                                            href="#"
                                            data-toggle="modal"
                                            data-target="#editQuest"
                                            :data-id="quest.id"
                                            @click.prevent="selectedQuest = quest"
                                        >
                                            edit
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <span v-else-if="!actionQuestsLoading" class="text-white-50">None...</span>
                    </div>
                    <h5 class="ml-4 mt-2">
                        <a href="#actionUsers" data-toggle="collapse">
                            Users
                            <i class="fas fa-angle-down" />
                        </a>
                        <span v-if="actionUsersLoading" class="ml-2 small text-white-50">loading...</span>
                    </h5>
                    <div v-if="actionUsers" id="actionUsers" class="show">
                        <table v-if="actionUsers.length" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">
                                    USERNAME
                                </th>
                                <th scope="col">
                                    RANK
                                </th>
                                <th scope="col">
                                    BADGE
                                </th>
                                <th scope="col">
                                    EDIT
                                </th>
                            </thead>
                            <tbody>
                                <tr v-for="user in actionUsers" :key="user.id" class="text-white-50">
                                    <td scope="row">
                                        <a :href="'https://osu.ppy.sh/users/' + user.osuId" target="_blank">{{ user.username }}</a>
                                    </td>
                                    <td scope="row">
                                        <i
                                            v-if="user.rank > 0"
                                            class="fas fa-crown"
                                            :class="user.rank == 1 ? 'text-rank-1' : user.rank == 2 ? 'text-rank-2' : 'text-rank-3'"
                                            data-toggle="tooltip"
                                            data-placement="top"
                                            :title="user.rank == 1 ? 'rank 1 user' : user.rank == 2 ? 'rank 2 user' : 'rank 3 user'"
                                        />
                                    </td>
                                    <td scope="row" :class="{ 'bg-open': user.rank != user.badge }">
                                        <i
                                            v-if="user.badge > 0"
                                            class="fas fa-crown"
                                            :class="user.badge == 1 ? 'text-rank-1' : user.badge == 2 ? 'text-rank-2' : 'text-rank-3'"
                                            data-toggle="tooltip"
                                            data-placement="top"
                                            :title="user.badge == 1 ? 'rank 1 user' : user.badge == 2 ? 'rank 2 user' : 'rank 3 user'"
                                        />
                                    </td>
                                    <td scope="row">
                                        <a
                                            href="#"
                                            data-toggle="modal"
                                            data-target="#editUser"
                                            :data-id="user.id"
                                            @click.prevent="selectedUser = user"
                                        >
                                            edit
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <span v-else-if="!actionUsersLoading" class="text-white-50">None...</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="radial-divisor mx-auto my-4" />

        <div class="container bg-container py-1">
            <div class="row">
                <div class="col">
                    <h5 class="ml-4 mt-2">
                        <a href="#users" data-toggle="collapse" @click.prevent="loadUsers()">
                            Users
                            <i class="fas fa-angle-down" />
                        </a>
                        <span v-if="usersLoading" class="ml-2 small text-white-50">loading...</span>
                        <button class="btn btn-sm btn-outline-info" @click="updateUserPoints($event)">
                            Update user points
                        </button>
                        <span v-if="calculatingPoints" class="ml-2 small text-white-50">calculating points...</span>
                    </h5>
                    <div id="users" class="collapse">
                        <table v-if="users.length" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">
                                    USERNAME
                                </th>
                                <th scope="col">
                                    RANK
                                </th>
                                <th scope="col">
                                    BADGE
                                </th>
                                <th scope="col">
                                    EDIT
                                </th>
                            </thead>
                            <tbody>
                                <tr v-for="user in users" :key="user.id" class="text-white-50">
                                    <td scope="row">
                                        <a :href="'https://osu.ppy.sh/users/' + user.osuId" target="_blank">{{ user.username }}</a>
                                    </td>
                                    <td scope="row">
                                        <i
                                            v-if="user.rank > 0"
                                            class="fas fa-crown"
                                            :class="user.rank == 1 ? 'text-rank-1' : user.rank == 2 ? 'text-rank-2' : 'text-rank-3'"
                                            data-toggle="tooltip"
                                            data-placement="top"
                                            :title="user.rank == 1 ? 'rank 1 user' : user.rank == 2 ? 'rank 2 user' : 'rank 3 user'"
                                        />
                                    </td>
                                    <td scope="row" :class="{ 'bg-open': user.rank != user.badge }">
                                        <i
                                            v-if="user.badge > 0"
                                            class="fas fa-crown"
                                            :class="user.badge == 1 ? 'text-rank-1' : user.badge == 2 ? 'text-rank-2' : 'text-rank-3'"
                                            data-toggle="tooltip"
                                            data-placement="top"
                                            :title="user.badge == 1 ? 'rank 1 user' : user.badge == 2 ? 'rank 2 user' : 'rank 3 user'"
                                        />
                                    </td>
                                    <td scope="row">
                                        <a
                                            href="#"
                                            data-toggle="modal"
                                            data-target="#editUser"
                                            :data-id="user.id"
                                            @click.prevent="selectedUser = user"
                                        >
                                            edit
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div class="radial-divisor mx-auto my-4" />

        <div class="container bg-container py-1">
            <div class="row">
                <div class="col">
                    <h5 class="ml-4 mt-2">
                        <a href="#featuredArtists" data-toggle="collapse" @click.prevent="loadFeaturedArtists()">
                            Featured Artists
                            <i class="fas fa-angle-down" />
                        </a>
                        <span v-if="featuredArtistsLoading" class="ml-2 small text-white-50">loading...</span>
                    </h5>
                    <div id="featuredArtists" class="collapse">
                        <table v-if="featuredArtists.length" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">
                                    ARTIST
                                </th>
                                <th scope="col">
                                    EDIT
                                </th>
                            </thead>
                            <tbody>
                                <tr v-for="featuredArtist in featuredArtists" :key="featuredArtist.id" class="text-white-50">
                                    <td scope="row">
                                        <a v-if="featuredArtist.osuId" :href="'https://osu.ppy.sh/beatmaps/artists/' + featuredArtist.osuId" target="_blank">{{ featuredArtist.label }}</a>
                                        <span v-else>{{ featuredArtist.label }}</span>
                                    </td>
                                    <td scope="row">
                                        <a
                                            href="#"
                                            data-toggle="modal"
                                            data-target="#editFeaturedArtist"
                                            :data-id="featuredArtist.id"
                                            @click.prevent="selectedFeaturedArtist = featuredArtist"
                                        >
                                            edit
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div class="radial-divisor mx-auto my-4" />

        <news-post />

        <user-info
            :user="selectedUser"
            @update-user="updateUser($event)"
        />

        <featured-artist-info
            :featured-artist="selectedFeaturedArtist"
            @update-featured-artist="updateFeaturedArtist($event)"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import NewsPost from '../components/admin/NewsPost.vue';
import UserInfo from '../components/admin/UserInfo.vue';
import FeaturedArtistInfo from '../components/admin/FeaturedArtistInfo.vue';
import { Beatmap } from '../../interfaces/beatmap/beatmap';
import { Quest } from '../../interfaces/quest';
import { User } from '../../interfaces/user';
import { FeaturedArtist } from '../../interfaces/featuredArtist';

export default Vue.extend({
    name: 'AdminPage',
    components: {
        NewsPost,
        UserInfo,
        FeaturedArtistInfo,
    },
    data() {
        return {
            actionBeatmaps: [] as Beatmap[],
            actionBeatmapsLoading: true,
            actionQuests: [] as Quest[],
            actionQuestsLoading: true,
            actionUsers: [] as User[],
            actionUsersLoading: true,
            beatmaps: [] as Beatmap[],
            beatmapsLoading: false,
            selectedBeatmap: null as null | Beatmap,
            quests: [] as Quest[],
            questsLoading: false,
            selectedQuest: null as null | Quest,
            users: [] as User[],
            usersLoading: false,
            selectedUser: null as null | User,
            featuredArtists: [] as FeaturedArtist[],
            featuredArtistsLoading: false,
            selectedFeaturedArtist: null as null | FeaturedArtist,
            calculatingPoints: false,
        };
    },
    async created() {
        $('#loading').fadeOut();
        $('#app').attr('style', 'visibility: visible').hide().fadeIn();
        const res: any = await this.executeGet('/admin/relevantInfo');

        if (res) {
            this.actionBeatmaps = res.actionBeatmaps;
            this.actionBeatmapsLoading = false;
            this.actionQuests = res.actionQuests;
            this.actionQuestsLoading = false;
            this.actionUsers = res.actionUsers;
            this.actionUsersLoading = false;
        }
    },
    methods: {
        generateMetadata(song): string {
            let metadata = song.artist + ' - ';

            if (song.title.length > 40) {
                metadata += song.title.slice(0,40) + '...';
            } else {
                metadata += song.title;
            }

            return metadata;
        },
        updateUser(u): void {
            if (this.users) {
                const i = this.users.findIndex(user => user.id == u.id);
                this.users[i] = u;
            }

            if (this.actionUsers) {
                const j = this.actionUsers.findIndex(user => user.id == u.id);
                this.actionUsers[j] = u;
            }

            this.selectedUser = u;
        },
        updateFeaturedArtist(fa): void {
            const i = this.featuredArtists.findIndex(featuredArtist => featuredArtist.id == fa.id);
            this.featuredArtists[i] = fa;
            this.selectedFeaturedArtist = fa;
        },
        async loadBeatmaps(): Promise<void> {
            if (!this.beatmaps.length) {
                this.beatmapsLoading = true;

                const res: any = await this.executeGet('/admin/loadBeatmaps');

                if (res) {
                    this.beatmaps = res.b;
                    this.beatmapsLoading = false;
                }
            }
        },
        async loadUsers(): Promise<void> {
            if (!this.users.length) {
                this.usersLoading = true;

                const res: any = await this.executeGet('/admin/loadUsers');

                if (res) {
                    this.users = res.u;
                    this.usersLoading = false;
                }
            }
        },
        async loadFeaturedArtists(): Promise<void> {
            if (!this.featuredArtists.length) {
                this.featuredArtistsLoading = true;

                const res: any = await this.executeGet('/admin/loadFeaturedArtists');

                if (res) {
                    this.featuredArtists = res.fa;
                    this.featuredArtistsLoading = false;
                }
            }
        },
        async updateUserPoints(e): Promise<void> {
            this.calculatingPoints = true;
            const success = await this.executePost('/admin/updateUserPoints/', {}, e);

            if (success) {
                this.calculatingPoints = false;
            }
        },
    },
});
</script>

<style>
.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}
</style>
