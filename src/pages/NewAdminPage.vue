<template>
    <div>

        <div class="container bg-container py-1">
            <div class="row">
                <div class="col">
                    <h5 class="ml-4 mt-2">
                        <a href="#beatmaps" data-toggle="collapse" >
                            Beatmaps
                            <i class="fas fa-angle-down" />
                        </a>
                    </h5>
                    <div id="beatmaps" class="collapse">
                        hello
                    </div>
                </div>
            </div>
        </div>

        <div class="radial-divisor mx-auto my-4"></div>

        <div class="container bg-container py-1">
            <div class="row">
                <div class="col">
                    <h5 class="ml-4 mt-2">
                        <a href="#quests" data-toggle="collapse" >
                            Quests
                            <i class="fas fa-angle-down" />
                        </a>
                    </h5>
                    <div id="quests" class="collapse">
                        hello
                    </div>
                </div>
            </div>
        </div>

        <div class="radial-divisor mx-auto my-4"></div>

        <div class="container bg-container py-1">
            <div class="row">
                <div class="col">
                    <h5 class="ml-4 mt-2">
                        <a href="#users" data-toggle="collapse" >
                            Users
                            <i class="fas fa-angle-down" />
                        </a>
                    </h5>
                    <div id="users" class="collapse">
                        hello
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
                                <tr v-for="featuredArtist in featuredArtists" :key="featuredArtist.id">
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
                                <tr v-for="error in errors" :key="error.id">
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

    </div>
</template>

<script>
export default {
    name: 'new-admin-page',
    components: {

    },
    methods: {
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
            featuredArtists: null,
            featuredArtistsLoading: false,
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
