<template>
<div class="row">
    <div class="col-lg-12">
        <div class="row">
            <h2>Ranked</h2>
        </div>
        <div class="row col-md-12 pb-2">
            <small>Search: 
                <input id="search" v-model="filterValue" type="text" placeholder="song/username/quest/mode... (3+ characters)" 
                    style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000); width: 280px;"
                /> 
            </small>
        </div> 
        <button :disabled="!(pre > 0 && filterValue.length < 3)" class="btn btn-sm btn-mg mx-auto my-2" style="display:block" type="button" @click="showNewer()">
            <i class="fas fa-angle-up mr-1"></i> show newer <i class="fas fa-angle-up ml-1"></i>
        </button>
        <transition-group name="list" tag="div" class="row">
            <beatmap-card
                v-for="beatmap in beatmaps"
                :key="beatmap.id"
                :beatmap="beatmap"
                @update:selectedMap="selectedMap = $event"
            ></beatmap-card>
        </transition-group>
        <div class="small text-center mx-auto" v-if="filterValue.length < 3">{{currentPage}} of {{pages}}</div>
        <button :disabled="!(canShowOlder && filterValue.length < 3)" class="btn btn-sm btn-mg mx-auto my-2" style="display:block" type="button" @click="showOlder()">
            <i class="fas fa-angle-down mr-1"></i> show older <i class="fas fa-angle-down ml-1"></i>
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
            if(v.length > 2){
                this.filter();
            }else{
                this.limit += 0.01; //decimal activates the watch without actually affecting limit
            }
        },
        limit: function () {
            this.limit = Math.round(this.limit);
            this.pre = this.limit - 24;
            this.currentPage = this.limit / 24;
            if (this.beatmaps) {
                if (this.limit >= this.allBeatmaps.length) {
                    this.canShowOlder = false;
                }
                this.beatmaps = this.allBeatmaps.slice(this.pre, this.limit);
            }
        }
    },
    methods: {
        showOlder: function () {
            if (this.canShowOlder && this.beatmaps) {
                this.limit += 24;
            }
        },
        showNewer: function () {
            if (this.pre > 0 && this.beatmaps) {
                this.limit -= 24;
                this.canShowOlder = true;
            }
        },

        // filters
        filter: function () {            
            this.filterValue = $("#search").val();
            this.beatmaps = this.allBeatmaps;
            if (this.filterValue.length) {
                this.beatmaps = this.beatmaps.filter(b => {
                    let valid = b.song.artist + ' ' + b.song.title + ' ' + b.host.username + ' ' + b.mode;
                    valid += b.quest ? (' ' + b.quest.name) : ' noquest';

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
            canShowOlder: true,
            pre: null,
            limit: null,
            pages: null,
            currentPage: null,
            filterValue: '',
		}
    },
    created () {
		axios
      		.get('/beatmapsarchive/relevantInfo')
      		.then(response => {
                this.beatmaps = response.data;
                this.allBeatmaps = response.data;
                this.pre = 0;
                this.limit = 24;
                this.pages = Math.ceil(this.allBeatmaps.length / this.limit);
                this.currentPage = 1;
                if (this.limit >= this.allBeatmaps.length) {
                    this.canShowOlder = false;
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
                    if(this.filterValue.length > 2){
                        this.filter();
                    }
                });
        }, 300000);
    }
}
</script>

<style>

</style>
