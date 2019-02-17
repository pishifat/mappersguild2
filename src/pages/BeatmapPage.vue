<template>
<div class="row">
    <div class="row col-md-12">
        <small>Filter: 
            <a :class="filterBy === 'myMaps' ? 'sorted' : ''" href="#" @click.prevent="filter('myMaps')">My maps</a> | 
            <a :class="filterBy === 'gds' ? 'sorted' : '' " href="#" @click.prevent="filter('gds')">Accepting guest difficulties</a> | 
            <a :class="filterBy === 'mapper' ? 'sorted' : ''" href="#" @click.prevent="filter('mapper')">Search mapper: </a> <input id="mapperFilter" type="text" @keyup.enter="filter('mapper', $event)" style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000);"></input> 
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
            <h2>Work-in-progress <button class="btn btn-mg" data-toggle="modal" data-target="#addBeatmap" @click="isCreateBeatmapVisible = true">Add beatmap</button></h2>
            <create-beatmap
                :visible="isCreateBeatmapVisible"
            ></create-beatmap>
        </div>

        <template v-for="quest in wipQuests">
            <div class="col-md-12" :key="quest.id" v-if="hasBeatmaps(quest, 'WIP')">
                <a data-toggle="collapse" :href="'#' + createCollapseId(quest.name) + 'Wip'">
                    <img v-if="quest.art" class="rounded-circle" style="height:24px; width: 24px;" :src="'https://assets.ppy.sh/artists/' + quest.art + '/cover.jpg'"> 
                    Quest: \{{quest.name}}
                </a> 
            </div>
            <transition-group :id="createCollapseId(quest.name) + 'Wip'" name="list" tag="div" class="row collapse show map-collapse" :key="quest.id">
                <beatmap-card
                    v-for="beatmap in beatmaps"
                    v-if="beatmap.quest && quest.id == beatmap.quest._id && beatmap.status == 'WIP'"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    :extended-info="extendedInfo"
                ></beatmap-card>
            </transition-group>
        </template>

        <a class="ml-3" data-toggle="collapse" href="#othersWip">No associated quest</a>
        <transition-group id="othersWip" name="list" tag="div" class="row collapse show map-collapse">
            <beatmap-card
                v-for="beatmap in beatmaps"
                v-if="!beatmap.quest && beatmap.status == 'WIP'"
                :key="beatmap.id"
                :beatmap="beatmap"
                :extended-info="extendedInfo"
            ></beatmap-card>
        </transition-group>
    </div>

    <!-- Pending Beatmaps -->
    <div class="col-lg-4">
        <div class="row">
            <h2>Pending</h2>
        </div>

        <template v-for="quest in wipQuests">
            <div class="col-md-12" :key="quest.id" v-if="hasBeatmaps(quest, 'Done')">
                <a data-toggle="collapse" :href="'#' + createCollapseId(quest.name) + 'done'">
                    <img v-if="quest.art" class="rounded-circle" style="height:24px; width: 24px;" :src="'https://assets.ppy.sh/artists/' + quest.art + '/cover.jpg'"> 
                    Quest: \{{quest.name}}
                </a> 
            </div>
            <transition-group :id="createCollapseId(quest.name) + 'done'" name="list" tag="div" class="row collapse show map-collapse" :key="quest.id">
                <beatmap-card
                    v-for="beatmap in beatmaps"
                    v-if="beatmap.quest && quest.id == beatmap.quest._id && beatmap.status == 'Done'"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    :extended-info="extendedInfo"
                ></beatmap-card>
            </transition-group>
        </template>

        <a class="ml-3" data-toggle="collapse" href="#othersDone">No associated quest</a>
        <transition-group id="othersDone" name="list" tag="div" class="row collapse show map-collapse">
            <beatmap-card
                v-for="beatmap in beatmaps"
                v-if="!beatmap.quest && beatmap.status == 'Done'"
                :key="beatmap.id"
                :beatmap="beatmap"
                :extended-info="extendedInfo"
            ></beatmap-card>
        </transition-group>
    </div>
    <beatmap-info
    ></beatmap-info>
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
    methods: {
		extendedInfo: function(beatmap) {
            this.selectedMap = beatmap;
            this.isHost = (this.userOsuId == beatmap.host.osuId);
            //sortDiffs();
        },
        resetArtist: function(){
            this.featuredSongs = null;
            axios
                .get('/beatmaps/artists')
                .then(response => {
                    this.featuredArtists = response.data.sort((a,b) => (a.label.toLowerCase() > b.label.toLowerCase()) ? 1 : ((b.label.toLowerCase() > a.label.toLowerCase()) ? -1 : 0));
                });
            this.info = null;
            $('input[type=checkbox]').each(function() 
            { 
                this.checked = false; 
            });
        },

        //display methods
        createCollapseId(name){
            return name.split(' ').join('');
        },
        isModder(){
            let value;
            this.selectedMap.modders.forEach(modder => {
                if(modder.osuId == this.userOsuId){
                    value = true;
                }
            });
            return value;
        },
        isBn(){
            let value;
            this.selectedMap.bns.forEach(bn => {
                if(bn.osuId == this.userOsuId){
                    value = true;
                }
            });
            return value;
        },
        urlLength(url){
            if(url.length > 40){
                return url.slice(0, 40) + "...";
            }else{
                return url;
            }
        },
        hasBeatmaps(quest, state) {
            return quest.associatedMaps.find(m => m.status == state);
        },

        //collapse
        collapseAll(){
            $(".map-collapse").collapse('hide');
        },
        uncollapseAll(){
            $(".map-collapse").collapse('show');
        },

        //new map
        setArtist: async function(e){
            let labelId = $("#artistSelection").val();
            e.target.disabled = true;
            axios
                .get('beatmaps/songs/' + labelId)
                .then(response => {
                    e.target.disabled = false;
                    this.featuredSongs = response.data.sort((a,b) => (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : ((b.title.toLowerCase() > a.title.toLowerCase()) ? -1 : 0));
                });
        },
        saveNewMap: async function(e){
            const song = $('#songSelection').val();
            if(song == "none"){
                this.info = "Select a song!"
            }else{
                const tasks = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert'];
                const difficulties = this.applyCheckboxes(tasks, false);
                const locks = this.applyCheckboxes(tasks, true); 
                const bm = await this.executePost('/beatmaps/create/', {song: song, tasks: difficulties, tasksLocked: locks}, e);
                if(bm){
                    $('#addBeatmap').modal('hide');
                    $('.quest-collapse-wip').collapse();
                    $('#othersWip').collapse("show");
                    this.beatmaps.unshift(bm);
                }
            }
        },
        applyCheckboxes(tasks, isLocks) {
            let difficulties = '';
        
            tasks.forEach(function(task) {
                let element;
        
                if (isLocks) {
                    element = `#lock-${task}`;
                } else {
                    element = `#${task}`;
                }
        
                if ($(element).is(':checked')) {
                    difficulties += `${task}|`;
                }
            });
            return difficulties.slice(0, -1);
        },
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
                this.beatmaps = this.beatmaps.filter(b => b.host.username == this.filterValue);
            } else if (field == 'gds') {
                this.tempBeatmaps = this.beatmaps;
                this.beatmaps = this.beatmaps.filter(b => (b.tasksLocked.length < 6 && b.status == "WIP"));
            }
        },
    },
    data () {
		return { 
            beatmaps: null,
            wipQuests: null,
			selectedMap: null,
            userOsuId: null,
            isHost: null,
            featuredArtists: null,
            featuredSongs: null,
            info: null,
            filterBy: null,
            filterValue: null,
            tempBeatmaps: null,
            isCreateBeatmapVisible: false,
		}
    },
    created () {
		axios
      		.get('/beatmaps/relevantInfo')
      		.then(response => {
                this.beatmaps = response.data.beatmaps;
                this.wipQuests = response.data.wipQuests;
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
