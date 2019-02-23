<template>
<div class="row">
    <div class="col-lg-12">
        <div class="row">
            <h2>Ranked</h2>
        </div>
        <div class="row col-md-12 pb-2">
            <small>Search: 
                <input id="search" v-model="filterValue" type="text" placeholder="song, username or quest..." 
                    style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000); width: 165px;"
                /> 
            </small>
        </div> 
        
        <transition-group name="list" tag="div" class="row">
            <beatmap-card
                v-for="beatmap in beatmaps"
                :key="beatmap.id"
                :beatmap="beatmap"
                @update:selectedMap="selectedMap = $event"
            ></beatmap-card>
        </transition-group>
        <button v-if="canShowMore && filterValue != ''" class="btn btn-sm btn-mg mx-auto my-2" style="display:block" type="button" @click="showMore()">
            <i class="fas fa-angle-down mr-1"></i> show more <i class="fas fa-angle-down ml-1"></i>
        </button>
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
        },
        limit: function () {
            if (this.beatmaps && this.canShowMore) {
                if (this.limit >= this.allBeatmaps.length) {
                    this.canShowMore = false;
                }
                this.beatmaps = this.allBeatmaps.slice(0, this.limit);
            }
        }
    },
    methods: {
        showMore: function () {
            if (this.canShowMore && this.beatmaps) {
                this.limit += 18;
            }
        },
        updateMap: function (bm) {
			const i = this.beatmaps.findIndex(b => b.id == bm.id);
			this.beatmaps[i] = bm;
            this.beatmap = bm;
            this.selectedMap = bm;
            this.info = null;
        },

        // filters
        filter: function () {            
            this.filterValue = $("#search").val();
            this.beatmaps = this.allBeatmaps;
            if (this.filterValue != "") {
                this.beatmaps = this.beatmaps.filter(b => {
                    let valid = b.song.title + ' ' + b.song.artist + ' ' + b.host.username;
                    valid += b.quest ? (' ' + b.quest.name) : '';

                    b.tasks.forEach(task => {
                        task.mappers.forEach(mapper => {
                            valid += ' ' + mapper.username;
                        });
                    });

                    if (valid.toLowerCase().trim().indexOf(this.filterValue.toLowerCase().trim()) > -1) {
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
			selectedMap: null,
            info: null,
            canShowMore: true,
            limit: null,
            filterValue: null,
		}
    },
    created () {
		axios
      		.get('/beatmapsarchive/relevantInfo')
      		.then(response => {
                this.beatmaps = response.data;
                this.allBeatmaps = response.data;
                this.limit = 32;
                if (this.limit >= this.allBeatmaps.length) {
                    this.canShowMore = false;
                }
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
                    this.allBeatmaps = response.data;
                    this.filter();
                });
        }, 30000);
    }
}
</script>

<style>

</style>
