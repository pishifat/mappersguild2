$(document).ready(function () {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});

Vue.component("beatmap-card", {
    props: ['beatmap', 'extendedInfo'],
    methods: {
        formatMetadata: function(artist, title) {
            let str = artist + " - " + title;
            if(str.length>39){
                return str.slice(0,39) + "...";
            }else{
                return str;
            }
        },
        processUrl: function(beatmapUrl){
            let url = 'https://osu.ppy.sh/images/layout/beatmaps/default-bg.png';

            if (beatmapUrl && beatmapUrl.indexOf('osu.ppy.sh/beatmapsets/') !== -1) {
                let indexStart = beatmapUrl.indexOf('beatmapsets/') + 'beatmapsets/'.length;
                let indexEnd = beatmapUrl.indexOf('#');
                let idUrl;
                if (indexEnd !== -1) {
                    idUrl = beatmapUrl.slice(indexStart, indexEnd);
                } else {
                    idUrl = beatmapUrl.slice(indexStart);
                }
        
                url = `https://assets.ppy.sh/beatmaps/${idUrl}/covers/card.jpg`;
            }
        
            return url;
        },
        processDiffs: function(tasks, tasksLocked){
            const diffs = [
                {name:"Easy", short:"E", count: 0}, 
                {name:"Normal", short:"N", count: 0}, 
                {name:"Hard", short:"H", count: 0}, 
                {name:"Insane", short:"I", count: 0}, 
                {name:"Expert", short:"X", count: 0}, 
            ];

            let diffsBlock = '';

            if(tasks.length >= 10){
                diffs.forEach(diff => {
                    tasks.forEach(task => {
                        if(diff.name == task.name){
                            diff.count++;
                        }
                    });
                    if(diff.count > 0){
                        if(diff.count == 1){
                            diffsBlock += `<span class="px-1 text-shadow done">${ diff.short }</span>`;
                        }else{
                            diffsBlock += `<span class="px-1 text-shadow" data-toggle="tooltip" data-placement="top" title="${diff.count}">${ diff.short }+</span>`;
                        }
                    }else if(tasksLocked.indexOf(diff.name) >= 0){
                        diffsBlock += `<span class="px-1 text-shadow blocked">${ diff.short }</span>`;
                    }else{
                        diffsBlock += `<span class="px-1 text-shadow blocked">${ diff.short }</span>`;
                    }
                });
            }else{
                diffs.forEach(diff => {
                    let isUsed = false;
                    tasks.forEach(task => {
                        if(diff.name == task.name){
                          diffsBlock += `<span class="px-1 text-shadow done">${ diff.short }</span>`;
            
                          isUsed = true;
                        }
                    });
                    if (!isUsed) {
                        diffsBlock += `<span class="px-1 text-shadow blocked">${ diff.short }</span>`;
                    }
                });
            }
            return diffsBlock;
        },
    },
    template: 
        `<div class='my-2 col-sm-4' @click="extendedInfo(beatmap)">
            <div class='card map-card custom-bg-dark border-status-ranked' data-toggle='modal' data-target='#editBeatmap' :data-mapid="beatmap.id">
                <img class='card-img' :src="processUrl(beatmap.url)" style='opacity:0.5; overflow:hidden'> 
                <div class='card-img-overlay' style='padding: 0.50rem 0.50rem 0 0.50rem'>
                    <p class='card-title mb-1 text-shadow'>{{ formatMetadata(beatmap.song.artist, beatmap.song.title) }}</p>
                <small class='card-text text-shadow'>
                    Hosted by <a :href="'https://osu.ppy.sh/users/' + beatmap.host.osuId" target="_blank" @click.stop>{{beatmap.host.username}}</a>
                    <span class='font-weight-bold float-right' style='text-shadow: 1px 1px 3px black;' v-html="processDiffs(beatmap.tasks, beatmap.tasksLocked)"></span>
                </small> 
                </div>
            </div>
        </div>`
});

const rankedVue = new Vue({
    el: '#app',
    methods: {
        extendedInfo: function (beatmap) {
            this.selectedMap = beatmap;
            this.info = null;
            this.isHost = (this.userOsuId == beatmap.host.osuId);
            this.addCollabInput = null;
            this.removeCollabInput = null;
            this.editLinkInput = null;
            this.collabTask = null;
        },
        resetArtist: function () {
            this.featuredSongs = null;
            this.info = null;
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

        //display methods
        createCollapseId(name) {
            return name.split(' ').join('');
        },
        isOwner(mappers) {
            let value;
            mappers.forEach(mapper => {
                if (mapper.osuId == this.userOsuId) {
                    value = true;
                }
            });
            return value;
        },
        isModder() {
            let value;
            this.selectedMap.modders.forEach(modder => {
                if (modder.osuId == this.userOsuId) {
                    value = true;
                }
            });
            return value;
        },
        isBn() {
            let value;
            this.selectedMap.bns.forEach(bn => {
                if (bn.osuId == this.userOsuId) {
                    value = true;
                }
            });
            return value;
        },
        urlLength(url) {
            if (url.length > 40) {
                return url.slice(0, 40) + "...";
            } else {
                return url;
            }
        },
        hasBeatmaps(quest, state) {
            return quest.associatedMaps.find(m => m.status == state);
        },
    },
    data() {
        return {
            beatmaps: null,
            completeQuests: null,
            selectedMap: null,
            searchMapper: null,
            filterBy: null,
            filterValue: null,
            tempBeatmaps: null,
        }
    },
    mounted() {
        axios
            .get('/ranked/relevantInfo')
            .then(response => {
                this.beatmaps = response.data.beatmaps;
                this.completeQuests = response.data.completeQuests;
            });
    }
});