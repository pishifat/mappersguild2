<template>
<div class="row">
    <div class="row col-md-12">
        <small>Search: 
            <input id="search" v-model="filterValue" type="text" placeholder="song or username..." style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000);" /> 
            <a href="#" class="pl-1" @click.prevent="collapseAll()">Collapse all</a> | <a href="#" @click.prevent="uncollapseAll()">Expand all</a> 
        </small>
    </div>    

    <!-- WIP Beatmaps -->
    <div class="col-lg-8">
        <div class="row">
            <h2>Work-in-progress <button class="btn btn-mg" data-toggle="modal" data-target="#addBeatmap" @click="openAddBeatmap()">Add beatmap</button></h2>
        </div>

        <template v-for="quest in wipQuests()">
            <div class="col-md-12" :key="quest.id">
                <a data-toggle="collapse" :href="'#' + createCollapseId(quest.name) + 'Wip'">
                    <img v-if="quest.art" class="rounded-circle" style="height:24px; width: 24px;" :src="'https://assets.ppy.sh/artists/' + quest.art + '/cover.jpg'"> 
                    Quest: {{quest.name}}
                </a> 
            </div>
            <transition-group :id="createCollapseId(quest.name) + 'Wip'" name="list" tag="div" class="row collapse show map-collapse" :key="quest.id + '-wip'">
                <beatmap-card
                    v-for="beatmap in getRelatedWipBeatmaps(quest)"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    :user-osu-id="userOsuId"
                    @update:selectedMap="selectedMap = $event"
                ></beatmap-card>
            </transition-group>
        </template>

        <a class="ml-3" data-toggle="collapse" href="#othersWip">No associated quest</a>
        <div id="othersWip" class="collapse show map-collapse">
            <transition-group name="list" tag="div" class="row">
                <beatmap-card
                    v-for="beatmap in othersWipBeatmaps()"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    :user-osu-id="userOsuId"
                    @update:selectedMap="selectedMap = $event"
                ></beatmap-card>
            </transition-group>
            <button v-if="showMoreWip" class="btn btn-sm btn-mg mx-auto my-2" style="display:block" type="button" @click="showMoreOthersWip()">
                <i class="fas fa-angle-down mr-1"></i> show more <i class="fas fa-angle-down ml-1"></i>
            </button>
        </div>
    </div>

    <!-- Pending Beatmaps -->
    <div class="col-lg-4">
        <div class="row">
            <h2>Pending</h2>
        </div>

        <template v-for="quest in pendingQuests()">
            <div class="col-md-12" :key="quest.id + '-done'">
                <a data-toggle="collapse" :href="'#' + createCollapseId(quest.name) + 'done'">
                    <img v-if="quest.art" class="rounded-circle" style="height:24px; width: 24px;" :src="'https://assets.ppy.sh/artists/' + quest.art + '/cover.jpg'"> 
                    Quest: {{quest.name}}
                </a> 
            </div>
            <transition-group :id="createCollapseId(quest.name) + 'done'" name="list" tag="div" class="row collapse show map-collapse" :key="quest.id">
                <beatmap-card
                    v-for="beatmap in getRelatedDoneBeatmaps(quest)"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    :user-osu-id="userOsuId"
                    @update:selectedMap="selectedMap = $event"
                ></beatmap-card>
            </transition-group>
        </template>

        <a class="ml-3" data-toggle="collapse" href="#othersDone">No associated quest</a>
        <div id="othersDone" class="collapse show map-collapse">
            <transition-group name="list" tag="div" class="row">
                <beatmap-card
                    v-for="beatmap in othersPendingBeatmaps()"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    :user-osu-id="userOsuId"
                    @update:selectedMap="selectedMap = $event"
                ></beatmap-card>
            </transition-group>
            <button v-if="showMorePending" class="btn btn-sm btn-mg mx-auto my-2" style="display:block" type="button" @click="showMoreOthersPending()">
                <i class="fas fa-angle-down mr-1"></i> show more <i class="fas fa-angle-down ml-1"></i>
            </button>
        </div>
    </div>

    <beatmap-info
        :beatmap="selectedMap"
        :user-osu-id="userOsuId"
        @update-map="updateMap($event)"
    ></beatmap-info>
    <create-beatmap
        :featured-artists="featuredArtists"
        :featured-songs="featuredSongs"
        :info="info"
    ></create-beatmap>
    <notifications-access></notifications-access>
</div>
</template>

<script>
import CreateBeatmap from '../components/beatmaps/CreateBeatmap.vue';
import BeatmapCard from '../components/beatmaps/BeatmapCard.vue';
import BeatmapInfo from '../components/beatmaps/BeatmapInfo.vue';
import NotificationsAccess from '../components/NotificationsAccess.vue';

export default {
    name: 'beatmap-page',
    components: {
        CreateBeatmap,
        BeatmapCard,
        BeatmapInfo,
        NotificationsAccess
    },
    watch:{
        beatmaps: function(v){
            if (v) {
                this.othersWipBeatmaps();
                this.othersPendingBeatmaps();
                this.wipQuests();
                this.pendingQuests();
            }
        },
        filterValue: function(v){
            this.filter();
        }
    },
    methods: {
        openAddBeatmap: function(){
            this.info = null;
            this.featuredSongs = null;
            $('input[type=checkbox]').each(function(){ 
                this.checked = false; 
            });
            if(!this.featuredArtists){
                axios
                    .get('/beatmaps/artists')
                    .then(response => {
                        this.featuredArtists = response.data.sort((a,b) => (a.label.toLowerCase() > b.label.toLowerCase()) ? 1 : ((b.label.toLowerCase() > a.label.toLowerCase()) ? -1 : 0));
                    });
            }
        },
        othersWipBeatmaps: function () {
            if(this.beatmaps){
                let maps = this.beatmaps.filter(b => b.status == 'WIP' && !b.quest);
                if(maps.length == maps.slice(0, this.moreOthersWip).length){
                    this.showMoreWip = false;
                }else{
                    this.showMoreWip = true;
                }
                return maps.slice(0, this.moreOthersWip);
            }
        },
        showMoreOthersWip: function(){
            this.moreOthersWip += 12;
            this.othersWipBeatmaps();
        },
        othersPendingBeatmaps: function () {
            if(this.beatmaps){
                let maps = this.beatmaps.filter(b => b.status == 'Done' && !b.quest);
                if(maps.length == maps.slice(0, this.moreOthersPending).length){
                    this.showMorePending = false;
                }else{
                    this.showMorePending = true;
                }
                return maps.slice(0, this.moreOthersPending);
            }
        },
        showMoreOthersPending: function(){
            this.moreOthersPending += 12;
            this.othersPendingBeatmaps();
        },
        wipQuests: function () {
            if(this.beatmaps){
                return this.allQuests.filter(q => {
                    if (q.associatedMaps.find(m => m.status == 'WIP')) {
                        return true;
                    }
                });
            }
        },
        pendingQuests: function () {
            if(this.beatmaps){
                return this.allQuests.filter(q => {
                    if (q.associatedMaps.find(m => m.status == 'Done')) {
                        return true;
                    }
                });
            }
        },
        getRelatedWipBeatmaps: function (quest) {
            return this.beatmaps.filter(b => {
                return b.quest && b.quest.id == quest.id && b.status == "WIP"
            });
        },
        getRelatedDoneBeatmaps: function (quest) {
            return this.beatmaps.filter(b => {
                return b.quest && b.quest.id == quest.id && b.status == "Done"
            });
        },
        updateMap: function(bm) {
            const i = this.beatmaps.findIndex(b => b.id == bm.id);
            this.beatmaps[i] = bm;
            this.beatmap = bm;
            this.selectedMap = bm;
            this.info = null;
        },

        //display methods
        createCollapseId(name){
            return name.split(' ').join('');
        },

        //collapse
        collapseAll(){
            $(".map-collapse").collapse('hide');
        },
        uncollapseAll(){
            $(".map-collapse").collapse('show');
        },

        // filters
        filter: function () {            
            this.filterValue = $("#search").val();
            this.beatmaps = this.allBeatmaps;
            if(this.filterValue != ""){
                this.beatmaps = this.beatmaps.filter(b => {
                    let valid = b.song.title + ' ' + b.song.artist + ' ' + b.host.username;
                    b.tasks.forEach(task => {
                        task.mappers.forEach(mapper => {
                            valid += ' ' + mapper.username;
                        });
                    });
                    if(valid.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1){
                        return true;
                    }
                    return false;
                });
            }
        },
    },
    data () {
		return { 
            beatmaps: null,
            allBeatmaps: null,
            allQuests: null,
			selectedMap: null,
            userOsuId: null,
            featuredArtists: null,
            featuredSongs: null,
            info: null,
            moreOthersWip: 16,
            showMoreWip: true,
            moreOthersPending: 8,
            showMorePending: true,
            filterValue: null,
		}
    },
    created () {
		axios
      		.get('/beatmaps/relevantInfo')
      		.then(response => {
                this.beatmaps = response.data.beatmaps;
                this.allBeatmaps = response.data.beatmaps;
                this.allQuests = response.data.allQuests;
                this.userOsuId = response.data.userId;
              }).then(function(){
                $("#loading").fadeOut();
				$("#app").attr("style", "visibility: visible").hide().fadeIn();
			});
    },
    mounted () {
        setInterval(() => {
            axios
                .get('/beatmaps/relevantInfo')
                .then(response => {
                    this.allBeatmaps = response.data.beatmaps;
                    this.allQuests = response.data.allQuests;
                    this.userOsuId = response.data.userId;
                });
        }, 30000);
    }
}
</script>

<style>

</style>
