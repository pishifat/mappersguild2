<template>
<div class="row">
    <div class="row col-md-12">
        <small>Filter: 
            <a :class="filterBy === 'myMaps' ? 'sorted' : ''" href="#" @click.prevent="filter('myMaps')">My maps</a> | 
            <a :class="filterBy === 'gds' ? 'sorted' : '' " href="#" @click.prevent="filter('gds')">Accepting guest difficulties</a> | 
            <a :class="filterBy === 'mapper' ? 'sorted' : ''" href="#" @click.prevent="filter('mapper')">Search mapper: </a> <input id="mapperFilter" type="text" @keyup.enter="filter('mapper', $event)" style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000);" /> 
        </small>
    </div>
    <div class="row mb-3 col-md-12">
        <small>
            Collapse: <a href="#" @click.prevent="collapseAll()">Collapse all</a> | <a href="#" @click.prevent="uncollapseAll()">Expand all</a> 
        </small>
    </div>

    <!-- WIP Beatmaps -->
    <div class="col-lg-8">
        <div class="row">
            <h2>Work-in-progress <button class="btn btn-mg" data-toggle="modal" data-target="#addBeatmap" @click="wasCreateBeatmapOpened = true">Add beatmap</button></h2>
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
        <transition-group id="othersWip" name="list" tag="div" class="row collapse show map-collapse">
            <beatmap-card
                v-for="beatmap in othersWipBeatmaps()"
                :key="beatmap.id"
                :beatmap="beatmap"
                :user-osu-id="userOsuId"
                @update:selectedMap="selectedMap = $event"
            ></beatmap-card>
        </transition-group>
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
        <transition-group id="othersDone" name="list" tag="div" class="row collapse show map-collapse">
            <beatmap-card
                v-for="beatmap in othersPendingBeatmaps()"
                :key="beatmap.id"
                :beatmap="beatmap"
                :user-osu-id="userOsuId"
                @update:selectedMap="selectedMap = $event"
            ></beatmap-card>
        </transition-group>
    </div>

    <beatmap-info
        :beatmap="selectedMap"
        :user-osu-id="userOsuId"
        @update-map="updateMap($event)"
    ></beatmap-info>
    <create-beatmap
        :opened="wasCreateBeatmapOpened"
    ></create-beatmap>
</div>
</template>

<script>
import CreateBeatmap from '../components/beatmaps/CreateBeatmap.vue';
import BeatmapCard from '../components/beatmaps/BeatmapCard.vue';
import BeatmapInfo from '../components/beatmaps/BeatmapInfo.vue';

export default {
    name: 'beatmap-page',
    components: {
        CreateBeatmap,
        BeatmapCard,
        BeatmapInfo,
    },
    watch:{
        beatmaps: function(){
            othersWipBeatmaps();
            othersPendingBeatmaps();
            wipQuests();
            pendingQuests();
        }
    },
    computed: {
        
    },
    methods: {
        othersWipBeatmaps: function () {
            if (this.beatmaps) {
                return this.beatmaps.filter(b => b.status == 'WIP' && !b.quest);
            }
        },
        othersPendingBeatmaps: function () {
            if (this.beatmaps) {
                return this.beatmaps.filter(b => b.status == 'Done' && !b.quest);
            }
        },
        wipQuests: function () {
            if (this.allQuests) {
                return this.allQuests.filter(q => {
                    if (q.associatedMaps.find(m => m.status == 'WIP')) {
                        return true;
                    }
                });
            }
        },
        pendingQuests: function () {
            if (this.allQuests) {
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
            console.log(this.beatmaps[i])
            this.beatmaps[i] = bm;
            console.log(this.beatmaps[i])
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
        filter: function (field, e, keepFilter) {            
            if (this.filterBy === field && !keepFilter) {
                this.filterBy = null;
                this.beatmaps = this.tempBeatmaps;
                return;
            }

            this.filterBy = field;

            if (this.tempBeatmaps) {
                this.beatmaps = this.tempBeatmaps;
            }

            if (field == 'myMaps') {
                this.tempBeatmaps = this.beatmaps;
                this.beatmaps = this.beatmaps.filter(b => b.host.osuId === this.userOsuId);
            } else if (field == 'mapper') {
                if (e) {
                    this.filterValue = e.target.value;
                }else{
                    this.filterValue = $("#mapperFilter").val();
                }

                this.tempBeatmaps = this.beatmaps;
                this.beatmaps = this.beatmaps.filter(b => b.host.username.toLowerCase() == this.filterValue.toLowerCase());
            } else if (field == 'gds') {
                this.tempBeatmaps = this.beatmaps;
                this.beatmaps = this.beatmaps.filter(b => (b.tasksLocked.length < 6 && b.status == "WIP"));
            }
        },
    },
    data () {
		return { 
            beatmaps: null,
            allQuests: null,
			selectedMap: null,
            userOsuId: null,
            featuredArtists: null,
            featuredSongs: null,
            info: null,
            filterBy: null,
            filterValue: null,
            tempBeatmaps: null,
            wasCreateBeatmapOpened: false,
		}
    },
    created () {
		axios
      		.get('/beatmaps/relevantInfo')
      		.then(response => {
                this.beatmaps = response.data.beatmaps;
                this.allQuests = response.data.allQuests;
                this.userOsuId = response.data.userId;
              }).then(function(){
                $("#loading").fadeOut();
				$("#app").attr("style", "visibility: visible").hide().fadeIn();
			});
    },
}
</script>

<style>

</style>
