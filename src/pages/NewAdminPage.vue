<template>
    <div>

        <div class="container bg-container py-1">
            <div class="row">
                <div class="col">
                    <h3 class="ml-2 mt-2">Beatmaps</h3>
                    <h5 class="ml-4 mt-2">
                        <a href="#beatmaps" data-toggle="collapse" @click.prevent="loadBeatmaps()">
                            Beatmaps
                            <i class="fas fa-angle-down" />
                        </a>
                        <span v-if="beatmapsLoading" class="ml-2 small text-white-50">loading...</span>
                    </h5>
                    <div id="beatmaps" class="collapse">
                        <table v-if="beatmaps" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">metadata</th>
                                <th scope="col">mode</th>
                                <th scope="col">status</th>
                                <th scope="col">edit</th>
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
                                    <td scope="row"><a href="#">edit</a></td>
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
                    </h5>
                    <div id="quests" class="collapse">
                        <table v-if="quests" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">name</th>
                                <th scope="col">edit</th>
                            </thead>
                            <tbody>
                                <tr v-for="quest in quests" :key="quest.id" class="text-white-50">
                                    <td scope="row">{{quest.name}}</td>
                                    <td scope="row"><a href="#">edit</a></td>
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
                    </h5>
                    <div id="users" class="collapse">
                        <table v-if="users" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">username</th>
                                <th scope="col">edit</th>
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
                                <th scope="col">artist</th>
                                <th scope="col">edit</th>
                            </thead>
                            <tbody>
                                <tr v-for="featuredArtist in featuredArtists" :key="featuredArtist.id" class="text-white-50">
                                    <td scope="row">
                                        <a v-if="featuredArtist.osuId" :href="'https://osu.ppy.sh/beatmaps/artists/' + featuredArtist.osuId" target="_blank">{{featuredArtist.label}}</a>
                                        <span v-else>{{featuredArtist.label}}</span>
                                    </td>
                                    <td scope="row" data-toggle="modal" data-target="#editSongs" :data-artistid="featuredArtist.id" @click.prevent="extendedArtist(featuredArtist)"><a href="#">edit</a></td>
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
                                <th scope="col">user</th>
                                <th scope="col">error</th>
                                <th scope="col">date</th>
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

    <user-info
        :user="selectedUser"
        @update-user="updateUser($event)"
    ></user-info>

    </div>
</template>

<script>
import UserInfo from '../components/admin/UserInfo.vue';

export default {
    name: 'new-admin-page',
    components: {
        UserInfo,
    },
    methods: {
        generateMetadata: function(song) {
            let metadata = song.artist + ' - ';
            if(song.title.length > 40){
                metadata += song.title.slice(0,40) + '...';
            }else{
                metadata += song.title;
            }
            return metadata;
        },
        updateUser: function(u) {
            const i = this.users.findIndex(user => user.id == u.id);
            this.users[i] = u;
            this.selectedUser = u;
        },
        loadBeatmaps: async function() {
            if(!this.beatmaps){
                this.beatmapsLoading = true;
                axios
                    .get('/newadmin/loadBeatmaps')
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
                    .get('/newadmin/loadQuests')
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
                    .get('/newadmin/loadUsers')
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
                    .get('/newadmin/loadFeaturedArtists')
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
                    .get('/newadmin/loadErrors')
                    .then(response => {
                        this.errors = response.data.e;
                        this.errorsLoading = false;
                    });
            }
        },
    },
    data() {
        return {
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
        }
    },
    mounted() {
        axios
            .get('/newadmin/relevantInfo')
            .then(response => {
                console.log('loaded');
            }).then(function(){
                $("#loading").fadeOut();
				$("#app").attr("style", "visibility: visible").hide().fadeIn();
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
