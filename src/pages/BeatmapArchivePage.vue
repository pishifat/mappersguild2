<template>
<div class="row">
    <div class="row col-md-12">
        <small>Filter: 
            <a :class="filterBy === 'myMaps' ? 'sorted' : ''" href="#" @click.prevent="filter('myMaps')">My maps</a> | 
            <a :class="filterBy === 'mapper' ? 'sorted' : ''" href="#" @click.prevent="filter('mapper')">Search mapper: </a> <input id="mapperFilter" type="text" @keyup.enter="filter('mapper', $event)" style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000);" /> 
        </small>
    </div>
    <div class="row mb-3 col-md-12">
        <small>
            Collapse: <a href="#" @click.prevent="collapseAll()">Collapse all</a> | <a href="#" @click.prevent="uncollapseAll()">Expand all</a> 
        </small>
    </div>

    <!-- WIP Beatmaps -->
    <div class="col-lg-12">
        <div class="row">
            <h2>Work-in-progress <button class="btn btn-mg" data-toggle="modal" data-target="#addBeatmap" @click="wasCreateBeatmapOpened = true">Add beatmap</button></h2>
        </div>

        <template v-for="quest in validCompleteQuests">
            <div class="col-md-12" :key="quest.id">
                <a data-toggle="collapse" :href="'#' + createCollapseId(quest.name) + 'Wip'">
                    <img v-if="quest.art" class="rounded-circle" style="height:24px; width: 24px;" :src="'https://assets.ppy.sh/artists/' + quest.art + '/cover.jpg'"> 
                    Quest: {{quest.name}}
                </a> 
            </div>
            <transition-group :id="createCollapseId(quest.name) + 'Wip'" name="list" tag="div" class="row collapse show map-collapse" :key="quest.id + '-wip'">
                <beatmap-card
                    v-for="beatmap in getRelatedBeatmaps(quest)"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    @update:selectedMap="selectedMap = $event"
                ></beatmap-card>
            </transition-group>
        </template>

        <a class="ml-3" data-toggle="collapse" href="#othersWip">No associated quest</a>
        <transition-group id="othersWip" name="list" tag="div" class="row collapse show map-collapse">
            <beatmap-card
                v-for="beatmap in othersBeatmaps"
                :key="beatmap.id"
                :beatmap="beatmap"
                @update:selectedMap="selectedMap = $event"
            ></beatmap-card>
        </transition-group>
    </div>

    <beatmap-info
        :beatmap="selectedMap"
    ></beatmap-info>
</div>
</template>

<script>
import BeatmapCard from '../components/beatmaps/BeatmapCard.vue';
import BeatmapInfo from '../components/beatmaps/BeatmapInfo.vue';

export default {
    name: 'beatmap-page',
    components: {
        BeatmapCard,
        BeatmapInfo,
    },
    computed: {
        othersBeatmaps: function () {
            if (this.beatmaps) {
                return this.beatmaps.filter(b => b.status == 'Ranked' && !b.quest);
            }
        },
        validCompleteQuests: function () {
            if (this.completeQuests) {
                return this.completeQuests.filter(q => {
                    if (q.associatedMaps.find(m => m.status == 'Ranked')) {
                        return true;
                    }
                });
            }
        },
    },
    methods: {
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
            }
        },
    },
    data () {
		return { 
            beatmaps: null,
            completeQuests: null,
			selectedMap: null,
            info: null,
            filterBy: null,
            filterValue: null,
            tempBeatmaps: null,
		}
    },
    created () {
		axios
      		.get('/beatmapsarchive/relevantInfo')
      		.then(response => {
                this.beatmaps = response.data.beatmaps;
                this.completeQuests = response.data.completeQuests;
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
                this.completeQuests = response.data.completeQuests;
                });
        }, 30000);
    }
}
</script>

<style>

</style>
