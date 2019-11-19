<template>
    <div>

        <div class="container bg-container py-1">
            <div class="row">
                <div class="col">
                    <h3 class="ml-2 mt-2">Beatmaps</h3>
                    <h5 class="ml-4 mt-2">
                        <a href="#actionBeatmaps" data-toggle="collapse">
                            Action Needed
                            <i class="fas fa-angle-down" />
                        </a>
                        <span v-if="actionBeatmapsLoading" class="ml-2 small text-white-50">loading...</span>
                    </h5>
                    <div id="actionBeatmaps" class="show">
                        <table v-if="actionBeatmaps" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">METADATA</th>
                                <th scope="col">MODE</th>
                                <th scope="col">STATUS</th>
                                <th scope="col">EDIT</th>
                            </thead>
                            <tbody>
                                <tr v-for="beatmap in actionBeatmaps" :key="beatmap.id" class="text-white-50">
                                    <td scope="row">
                                        <i v-if="beatmap.mode == 'osu'" class="fas fa-circle"></i>
                                        <i v-else-if="beatmap.mode == 'taiko'" class="fas fa-drum"></i>
                                        <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt"></i>
                                        <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream"></i>
                                        <a v-if="beatmap.url" :href="beatmap.url">
                                            {{generateMetadata(beatmap.song)}}
                                        </a>
                                        <span v-else>{{generateMetadata(beatmap.song)}}</span>
                                    </td>
                                    <td scope="row">
                                        {{beatmap.mode}}
                                    </td>
                                    <td scope="row">
                                        {{beatmap.status}}
                                    </td>
                                    <td scope="row">
                                        <a href="#" data-toggle="modal" data-target="#editBeatmap" :data-id="beatmap.id" @click.prevent="selectedBeatmap = beatmap">
                                            edit
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <h5 class="ml-4 mt-2">
                        <a href="#beatmaps" data-toggle="collapse" @click.prevent="loadBeatmaps()">
                            All Beatmaps
                            <i class="fas fa-angle-down" />
                        </a>
                        <span v-if="beatmapsLoading" class="ml-2 small text-white-50">loading...</span>
                    </h5>
                    <div id="beatmaps" class="collapse">
                        <table v-if="beatmaps" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">METADATA</th>
                                <th scope="col">MODE</th>
                                <th scope="col">STATUS</th>
                                <th scope="col">EDIT</th>
                            </thead>
                            <tbody>
                                <tr v-for="beatmap in beatmaps" :key="beatmap.id" class="text-white-50">
                                    <td scope="row">
                                        <i v-if="beatmap.mode == 'osu'" class="fas fa-circle"></i>
                                        <i v-else-if="beatmap.mode == 'taiko'" class="fas fa-drum"></i>
                                        <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt"></i>
                                        <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream"></i>
                                        <a v-if="beatmap.url" :href="beatmap.url">
                                            {{generateMetadata(beatmap.song)}}
                                        </a>
                                        <span v-else>{{generateMetadata(beatmap.song)}}</span>
                                    </td>
                                    <td scope="row">
                                        {{beatmap.mode}}
                                    </td>
                                    <td scope="row">
                                        {{beatmap.status}}
                                    </td>
                                    <td scope="row">
                                        <a href="#" data-toggle="modal" data-target="#editBeatmap" :data-id="beatmap.id" @click.prevent="selectedBeatmap = beatmap">
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

        <div class="radial-divisor mx-auto my-4"></div>

        <div class="container bg-container py-1">
            <div class="row">
                <div class="col">
                    <h5 class="ml-4 mt-2">
                        <a href="#quests" data-toggle="collapse" @click.prevent="loadQuests()">
                            Quests
                            <i class="fas fa-angle-down" />
                        </a>
                        <span v-if="questsLoading" class="ml-2 small text-white-50">loading...</span>
                        <button class="btn btn-sm btn-outline-info" data-toggle="modal" data-target="#addQuest">
                            Add quest
                        </button>
                    </h5>
                    <div id="quests" class="collapse">
                        <table v-if="quests" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">NAME</th>
                                <th scope="col">STATUS</th>
                                <th scope="col">EDIT</th>
                            </thead>
                            <tbody>
                                <tr v-for="quest in quests" :key="quest.id" class="text-white-50">
                                    <td scope="row">{{quest.name}}</td>
                                    <td scope="row">{{quest.status}}</td>
                                    <td scope="row">
                                        <a href="#" data-toggle="modal" data-target="#editQuest" :data-id="quest.id" @click.prevent="selectedQuest = quest">
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

        <div class="radial-divisor mx-auto my-4"></div>

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
                        <table v-if="users" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">USERNAME</th>
                                <th scope="col">EDIT</th>
                            </thead>
                            <tbody>
                                <tr v-for="user in users" :key="user.id" class="text-white-50">
                                    <td scope="row">
                                        <a :href="'https://osu.ppy.sh/users/' + user.osuId" target="_blank">{{user.username}}</a>
                                    </td>
                                    <td scope="row">
                                        <a href="#" data-toggle="modal" data-target="#editUser" :data-id="user.id" @click.prevent="selectedUser = user">
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

        <div class="radial-divisor mx-auto my-4"></div>

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
                        <table v-if="featuredArtists" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">ARTIST</th>
                                <th scope="col">EDIT</th>
                            </thead>
                            <tbody>
                                <tr v-for="featuredArtist in featuredArtists" :key="featuredArtist.id" class="text-white-50">
                                    <td scope="row">
                                        <a v-if="featuredArtist.osuId" :href="'https://osu.ppy.sh/beatmaps/artists/' + featuredArtist.osuId" target="_blank">{{featuredArtist.label}}</a>
                                        <span v-else>{{featuredArtist.label}}</span>
                                    </td>
                                    <td scope="row" data-toggle="modal" data-target="#editFeaturedArtist" :data-id="featuredArtist.id" @click.prevent="selectedFeaturedArtist = featuredArtist">
                                        <a href="#">
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

        <div class="radial-divisor mx-auto my-4"></div>

        <div class="container bg-container py-1">
            <div class="row">
                <div class="col">
                    <h5 class="ml-4 mt-2">
                        <a href="#errors" data-toggle="collapse" @click.prevent="loadErrors()">
                            Errors
                            <i class="fas fa-angle-down" />
                        </a>
                        <span v-if="errorsLoading" class="ml-2 small text-white-50">loading...</span>
                    </h5>
                    <div id="errors" class="collapse">
                        <table v-if="errors" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">USER</th>
                                <th scope="col">ERROR</th>
                                <th scope="col">DATE</th>
                            </thead>
                            <tbody>
                                <tr v-for="error in errors" :key="error.id" class="text-white-50">
                                    <td scope="row">{{error.user ? error.user.username : '...' }}</td>
                                    <td scope="row">{{error.action.length > 125 ? error.action.slice(0,125) + '...' : error.action}}</td>
                                    <td scope="row">{{error.createdAt}}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

    <beatmap-info
        :beatmap="selectedBeatmap"
        @update-beatmap="updateBeatmap($event)"
    ></beatmap-info>

    <add-quest
        @add-quest="addQuest($event)"
    ></add-quest>

    <quest-info
        :quest="selectedQuest"
        @update-quest="updateQuest($event)"
        @delete-quest="deleteQuest($event)"
    ></quest-info>

    <user-info
        :user="selectedUser"
        @update-user="updateUser($event)"
    ></user-info>

    <featured-artist-info
        :featured-artist="selectedFeaturedArtist"
        @update-featured-artist="updateFeaturedArtist($event)"
    ></featured-artist-info>

    </div>
</template>

<script>
import BeatmapInfo from '../components/admin/BeatmapInfo.vue';
import AddQuest from '../components/admin/AddQuest.vue';
import QuestInfo from '../components/admin/QuestInfo.vue';
import UserInfo from '../components/admin/UserInfo.vue';
import FeaturedArtistInfo from '../components/admin/FeaturedArtistInfo.vue';

export default {
    name: 'admin-page',
    components: {
        BeatmapInfo,
        AddQuest,
        QuestInfo,
        UserInfo,
        FeaturedArtistInfo,
    },
    methods: {
        executePost: async function(path, data, e) {
            if (e) e.target.disabled = true;

            try {
                const res = await axios.post(path, data);

                if (res.data.error) {
                    this.info = res.data.error;
                } else {
                    if (e) e.target.disabled = false;
                    return res.data;
                }
            } catch (error) {
                console.log(error);
            }

            if (e) e.target.disabled = false;
        },
        generateMetadata: function(song) {
            let metadata = song.artist + ' - ';
            if(song.title.length > 40){
                metadata += song.title.slice(0,40) + '...';
            }else{
                metadata += song.title;
            }
            return metadata;
        },
        updateBeatmap: function(b) {
            const i = this.beatmaps.findIndex(beatmap => beatmap.id == b.id);
            this.beatmaps[i] = b;
            this.selectedBeatmap = b;
        },
        updateQuest: function(q) {
            const i = this.quests.findIndex(quest => quest.id == q.id);
            this.quests[i] = q;
            this.selectedQuest = q;
        },
        addQuest: function(q) {
            if(this.quests){
                this.quests.unshift(q);
            }
        },
        deleteQuest: function(q) {
            const i = this.quests.findIndex(quest => quest.id == q.id);
            this.quests.splice(i, 1);
        },
        updateUser: function(u) {
            const i = this.users.findIndex(user => user.id == u.id);
            this.users[i] = u;
            this.selectedUser = u;
        },
        updateFeaturedArtist: function(fa) {
            const i = this.featuredArtists.findIndex(featuredArtist => featuredArtist.id == fa.id);
            this.featuredArtists[i] = fa;
            this.selectedFeaturedArtist = fa;
        },
        loadBeatmaps: async function() {
            if(!this.beatmaps){
                this.beatmapsLoading = true;
                axios
                    .get('/admin/loadBeatmaps')
                    .then(response => {
                        this.beatmaps = response.data.b;
                        this.beatmapsLoading = false;
                    });
            }
        },
        loadQuests: async function() {
            if(!this.quests){
                this.questsLoading = true;
                axios
                    .get('/admin/loadQuests')
                    .then(response => {
                        this.quests = response.data.q;
                        this.questsLoading = false;
                    });
            }
        },
        loadUsers: async function() {
            if(!this.users){
                this.usersLoading = true;
                axios
                    .get('/admin/loadUsers')
                    .then(response => {
                        this.users = response.data.u;
                        this.usersLoading = false;
                    });
            }
        },
        loadFeaturedArtists: async function() {
            if(!this.featuredArtists){
                this.featuredArtistsLoading = true;
                axios
                    .get('/admin/loadFeaturedArtists')
                    .then(response => {
                        this.featuredArtists = response.data.fa;
                        this.featuredArtistsLoading = false;
                    });
            }
        },
        loadErrors: async function() {
            if(!this.errors){
                this.errorsLoading = true;
                axios
                    .get('/admin/loadErrors')
                    .then(response => {
                        this.errors = response.data.e;
                        this.errorsLoading = false;
                    });
            }
        },
        updateUserPoints: async function(e) {
            this.calculatingPoints = true;
            const success = await this.executePost('/admin/updateUserPoints/', {}, e);
            if (success) {
                this.calculatingPoints = false;
            }
        },
    },
    data() {
        return {
            actionBeatmaps: null,
            actionBeatmapsLoading: true,
            beatmaps: null,
            beatmapsLoading: false,
            selectedBeatmap: null,
            quests: null,
            questsLoading: false,
            selectedQuest: null,
            users: null,
            usersLoading: false,
            selectedUser: null,
            featuredArtists: null,
            featuredArtistsLoading: false,
            selectedFeaturedArtist: null,
            errors: null,
            errorsLoading: false,
            calculatingPoints: false,
        }
    },
    mounted() {
        $("#loading").fadeOut();
        $("#app").attr("style", "visibility: visible").hide().fadeIn();
        axios
            .get('/admin/relevantInfo')
            .then(response => {
                this.actionBeatmaps = response.data.actionBeatmaps;
                this.actionBeatmapsLoading = false;
            });
    }
}
</script>

<style>
.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}
</style>
