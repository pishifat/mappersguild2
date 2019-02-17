import Vue from 'vue';
import BeatmapPage from './pages/BeatmapPage.vue';

$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    var src = "../images/small.png"
    $("#load").attr("src", src);
});

const beatmapsVue = new Vue({
    el: '#app',
    components: {
        BeatmapPage,
    },
	methods: {
		extendedInfo: function(beatmap) {
            this.selectedMap = beatmap;
            this.isHost = (this.userOsuId == beatmap.host.osuId);
            //sortDiffs();
        },

        //collapse
        collapseAll(){
            $(".map-collapse").collapse('hide');
        },
        uncollapseAll(){
            $(".map-collapse").collapse('show');
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
            info: null,
            filterBy: null,
            filterValue: null,
            tempBeatmaps: null,
		}
    },
});

setInterval(() => {
    axios
        .get('/beatmaps/relevantInfo')
        .then(response => {
            beatmapsVue.beatmaps = response.data.beatmaps;
            beatmapsVue.wipQuests = response.data.wipQuests;
            beatmapsVue.userOsuId = response.data.userId;
            beatmapsVue.filter(beatmapsVue.filterBy, null, true);
        });
}, 30000);
