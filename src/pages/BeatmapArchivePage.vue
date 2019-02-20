<template>
<div class="row">
    <div class="row col-md-12">
        <small>Search: 
            <input id="search" v-model="filterValue" type="text" placeholder="song or username..." style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000);" /> 
            <a href="#" class="pl-1" @click.prevent="collapseAll()">Collapse all</a> | <a href="#" @click.prevent="uncollapseAll()">Expand all</a> 
        </small>
    </div> 

    <div class="col-lg-12">
        <div class="row">
            <h2>Ranked</h2>
        </div>

        <template v-for="quest in validQuests">
            <div class="col-md-12" :key="quest.id">
                <a data-toggle="collapse" :href="'#' + createCollapseId(quest.name) + 'Ranked'">
                    <img v-if="quest.art" class="rounded-circle" style="height:24px; width: 24px;" :src="'https://assets.ppy.sh/artists/' + quest.art + '/cover.jpg'"> 
                    Quest: {{quest.name}}
                </a> 
            </div>
            <transition-group :id="createCollapseId(quest.name) + 'Ranked'" name="list" tag="div" class="row collapse show map-collapse" :key="quest.id + '-ranked'">
                <beatmap-card
                    v-for="beatmap in getRelatedBeatmaps(quest)"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    @update:selectedMap="selectedMap = $event"
                ></beatmap-card>
            </transition-group>
        </template>

        <a class="ml-3" data-toggle="collapse" href="#othersRanked">No associated quest</a>
        <div id="othersRanked" class="collapse show map-collapse">
            <transition-group name="list" tag="div" class="row">
                <beatmap-card
                    v-for="beatmap in othersBeatmaps()"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    @update:selectedMap="selectedMap = $event"
                ></beatmap-card>
            </transition-group>
            <button v-if="showMore" class="btn btn-sm btn-mg mx-auto my-2" style="display:block" type="button" @click="showMoreOthers()">
                <i class="fas fa-angle-down mr-1"></i> show more <i class="fas fa-angle-down ml-1"></i>
            </button>
        </div>
    </div>

    <beatmap-info
        :beatmap="selectedMap"
    ></beatmap-info>
    <notifications-access></notifications-access>
</div>
</template>

<script>
import BeatmapCard from '../components/beatmaps/BeatmapCard.vue';
import BeatmapInfo from '../components/beatmaps/BeatmapInfo.vue';
import NotificationsAccess from '../components/NotificationsAccess.vue';

export default {
    name: 'beatmap-archive-page',
    components: {
        BeatmapCard,
        BeatmapInfo,
        NotificationsAccess
    },
    watch:{
        filterValue: function(v){
            this.filter();
        }
    },
    computed: {
        validQuests: function () {
            if (this.quests) {
                return this.quests.filter(q => {
                    if (q.associatedMaps.find(m => m.status == 'Ranked')) {
                        return true;
                    }
                });
            }
        },
    },
    methods: {
        othersBeatmaps: function () {
            if(this.beatmaps){
                let maps = this.beatmaps.filter(b => b.status == 'Ranked' && !b.quest);
                if(maps.length == maps.slice(0, this.moreOthers).length){
                    this.showMore = false;
                }
                return maps.slice(0, this.moreOthers);
            }
        },
        showMoreOthers: function(){
            this.moreOthers += 18;
            this.othersBeatmaps();
        },
        getRelatedBeatmaps: function (quest) {
            return this.beatmaps.filter(b => {
                return b.quest && b.quest.id == quest.id
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
            quests: null,
			selectedMap: null,
            info: null,
            moreOthers: 36,
            showMore: true,
            filterValue: null,
		}
    },
    created () {
		axios
      		.get('/beatmapsarchive/relevantInfo')
      		.then(response => {
                this.beatmaps = response.data.beatmaps;
                this.allBeatmaps = response.data.beatmaps;
                this.quests = response.data.quests;
            }).then(function(){
                $("#loading").fadeOut();
				$("#app").attr("style", "visibility: visible").hide().fadeIn();
			});
    },
    mounted () {
        setInterval(() => {
            axios
                .get('/beatmapsarchive/relevantInfo')
                .then(response => {
                this.beatmaps = response.data.beatmaps;
                this.allBeatmaps = response.data.beatmaps;
                this.quests = response.data.quests;
                });
        }, 30000);
    }
}
</script>

<style>

</style>
