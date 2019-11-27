<template>
    <div>
        <div class="container bg-container py-3 mb-2">
            <filter-box
                :filterValue.sync="filterValue"
                :filterMode.sync="filterMode"
                :filterStatus.sync="filterStatus"
                :filterQuest.sync="filterQuest"
                :all-quests="allQuests"
                placeholder="song/username..."
                @self-filter="selfFilter()"
                :isLoading.sync="isLoading"
            >
                <button
                    class="btn btn-outline-info"
                    href="#"
                    data-toggle="modal"
                    data-target="#addBeatmap"
                    @click.prevent="openAddBeatmap()"
                >
                    Add beatmap <i class="fas fa-plus small"></i>
                </button>
            </filter-box>
        </div>

        <div class="container bg-container py-3">
            <h3>
                My beatmaps 
                <span v-if="isLoading" class="text-white-50" style="font-size: 9pt;">loading...</span>
            </h3>
            <h5 class="ml-4">
                <a href="#hostBeatmaps" data-toggle="collapse" >
                    My mapsets ({{hostBeatmaps ? hostBeatmaps.length : '...'}})
                    <i class="fas fa-angle-down" />
                </a>
            </h5>
            <div v-if="hostBeatmaps" id="hostBeatmaps" class="show">
                <transition-group name="list" tag="div" class="row">
                    <beatmap-card
                        v-for="beatmap in hostBeatmaps"
                        :key="beatmap.id"
                        :beatmap="beatmap"
                        :user-osu-id="userOsuId"
                        @update:selectedMap="selectedMap = $event"
                    ></beatmap-card>
                </transition-group>
                <p v-if="!hostBeatmaps.length" class="ml-5 text-white-50">None...</p>
            </div>
            <h5 class="ml-4 mt-2">
                <a href="#guestDifficultyBeatmaps" data-toggle="collapse" >
                    My guest difficulties ({{guestDifficultyBeatmaps ? guestDifficultyBeatmaps.length : '...'}}) 
                    <i class="fas fa-angle-down" />
                </a>
            </h5>
            <div v-if="guestDifficultyBeatmaps" id="guestDifficultyBeatmaps" class="collapse">
                <transition-group name="list" tag="div" class="row">
                    <beatmap-card
                        v-for="beatmap in guestDifficultyBeatmaps"
                        :key="beatmap.id"
                        :beatmap="beatmap"
                        :user-osu-id="userOsuId"
                        @update:selectedMap="selectedMap = $event"
                    ></beatmap-card>
                </transition-group>
                <p v-if="!guestDifficultyBeatmaps.length" class="ml-5 text-white-50">None...</p>
            </div>
        </div>

        <div class="radial-divisor mx-auto my-4"></div>

        <div class="container bg-container py-3">
            <h3>
                Other beatmaps
                <button class="btn btn-sm btn-outline-info mx-2" @click.prevent="toggleInactive($event)" data-toggle="tooltip" data-placement="top" title="toggle visibility of beatmaps older than 30 days">
                    {{ toggleInactiveBeatmaps ? 'Hide inactive beatmaps' : 'Show inactive beatmaps' }}
                </button>
                <span v-if="isLoading" class="text-white-50" style="font-size: 9pt;">loading...</span>
            </h3>
            <h5 class="ml-4">
                <a href="#workInProgressBeatmaps" data-toggle="collapse" >
                    Work-in-progress beatmaps ({{workInProgressBeatmaps ? workInProgressBeatmaps.length : '...'}})
                    <i class="fas fa-angle-down" />
                </a>
            </h5>
            <div v-if="workInProgressBeatmaps" id="workInProgressBeatmaps" class="collapse">
                <p v-for="beatmap in workInProgressBeatmaps" :key="beatmap.id" class="small min-spacing">
                    {{beatmap.song.artist}} - {{beatmap.song.title}} ({{beatmap.host.username}})
                </p>
                <p v-if="!workInProgressBeatmaps.length" class="ml-5 text-white-50">None...</p>
            </div>
            <h5 class="ml-4 mt-2">
                <a href="#pendingBeatmaps" data-toggle="collapse" >
                    Pending beatmaps ({{pendingBeatmaps ? pendingBeatmaps.length : '...'}})
                    <i class="fas fa-angle-down" />
                </a>
            </h5>
            <div v-if="pendingBeatmaps" id="pendingBeatmaps" class="collapse">
                <p v-for="beatmap in pendingBeatmaps" :key="beatmap.id" class="small min-spacing">
                    {{beatmap.song.artist}} - {{beatmap.song.title}} ({{beatmap.host.username}})
                </p>
                <p v-if="!pendingBeatmaps.length" class="ml-5 text-white-50">None...</p>
            </div>
            <h5 class="ml-4 mt-2">
                <a href="#qualifiedBeatmaps" data-toggle="collapse" >
                    Qualified beatmaps ({{qualifiedBeatmaps ? qualifiedBeatmaps.length : '...'}})
                    <i class="fas fa-angle-down" />
                </a>
            </h5>
            <div v-if="qualifiedBeatmaps" id="qualifiedBeatmaps" class="collapse">
                <p v-for="beatmap in qualifiedBeatmaps" :key="beatmap.id" class="small min-spacing">
                    {{beatmap.song.artist}} - {{beatmap.song.title}} ({{beatmap.host.username}})
                </p>
                <p v-if="!qualifiedBeatmaps.length" class="ml-5 text-white-50">None...</p>
            </div>
            <h5 class="ml-4 mt-2">
                <a href="#rankedBeatmaps" data-toggle="collapse" >
                    Ranked beatmaps ({{rankedBeatmaps ? rankedBeatmaps.length : '...'}})
                    <i class="fas fa-angle-down" />
                </a>
            </h5>
            <div v-if="rankedBeatmaps" id="rankedBeatmaps" class="collapse">
                <p v-for="beatmap in rankedBeatmaps" :key="beatmap.id" class="small min-spacing">
                    {{beatmap.song.artist}} - {{beatmap.song.title}} ({{beatmap.host.username}})
                </p>
                <p v-if="!rankedBeatmaps.length" class="ml-5 text-white-50">None...</p>
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

        <notifications-access v-if="usergroup != 'spectator'"></notifications-access>
    </div>
</template>

<script>
import CreateBeatmap from '../components/beatmaps/CreateBeatmap.vue';
import BeatmapCard from '../components/beatmaps/BeatmapCard.vue';
import BeatmapInfo from '../components/beatmaps/BeatmapInfo.vue';
import FilterBox from '../components/FilterBox.vue';
import NotificationsAccess from '../components/NotificationsAccess.vue';

export default {
    name: 'beatmap-page',
    components: {
        CreateBeatmap,
        BeatmapCard,
        BeatmapInfo,
        FilterBox,
        NotificationsAccess,
    },
    watch: {
        filterValue: function(v) {
            this.filter();
        },
        filterMode: function(v) {
            this.loadBeatmaps();
        },
        filterStatus: function(v) {
            this.filter();
        },
        filterQuest: function(v) {
            this.filter();
        },
    },
    methods: {
        openAddBeatmap: function() {
            this.info = null;
            this.featuredSongs = null;
            $('input[type=checkbox]').each(function() {
                this.checked = false;
            });
            if (!this.featuredArtists) {
                axios.get('/beatmaps/artists').then(response => {
                    this.featuredArtists = response.data.sort((a, b) => {
                        if (a.label.toLowerCase() > b.label.toLowerCase()) {
                            return 1;
                        } else if (b.label.toLowerCase() > a.label.toLowerCase()) {
                            return -1;
                        }
                        return 0;
                    });
                });
            }
        },
        loadBeatmaps: async function(e) {
            if (e) e.target.disabled = true;
            let mode = this.filterMode;
            let inactive;
            this.isLoading = true;
            if(!this.filterMode.length) mode = 'any';
            this.toggleInactiveBeatmaps ? inactive = 'show' : inactive = 'hide';
            console.log(inactive);
            axios
                .get('/beatmaps/loadBeatmaps/' + mode + '/' + inactive)
                .then(response => {
                    this.allObjs = response.data.statusBeatmaps.concat(response.data.guestDifficultyBeatmaps);
                    this.pageObjs = this.allObjs;
                    this.filter();
                    this.isLoading = false;
                    if (e) e.target.disabled = false;
            })
        },
        separateObjs: function() {
            this.hostBeatmaps = [];
            this.guestDifficultyBeatmaps = [];
            this.workInProgressBeatmaps = [];
            this.pendingBeatmaps = [];
            this.qualifiedBeatmaps = [];
            this.rankedBeatmaps = [];
            this.pageObjs.forEach(beatmap => {
                if(beatmap.host.osuId == this.userOsuId){
                    this.hostBeatmaps.push(beatmap);
                }else{
                    let breakLoop = false;
                    for (let i = 0; i < beatmap.tasks.length; i++) {
                        const task = beatmap.tasks[i];
                        for (let j = 0; j < task.mappers.length; j++) {
                            const mapper = task.mappers[j];
                            if(mapper.osuId == this.userOsuId){
                                this.guestDifficultyBeatmaps.push(beatmap);
                                breakLoop = true;
                                break;
                            }
                        }
                        if(breakLoop){
                            break;
                        }
                    }
                    if(!breakLoop){
                        if(beatmap.status == 'WIP'){
                            this.workInProgressBeatmaps.push(beatmap);
                        }else if(beatmap.status == 'Done'){
                            this.pendingBeatmaps.push(beatmap);
                        }else if(beatmap.status == 'Qualified'){
                            this.qualifiedBeatmaps.push(beatmap);
                        }else if(beatmap.status == 'Ranked'){
                            this.rankedBeatmaps.push(beatmap);
                        }
                    }
                }
            });
            /*let duplicate;
            this.pageObjs.forEach(b => {
                if (b.quest && b.quest.name != duplicate) {
                    duplicate = b.quest.name;
                    this.allQuests.push({ id: b.quest.id, name: b.quest.name, art: b.quest.art });
                }
            });*/
        },
        updateMap: function(bm) {
            const i = this.beatmaps.findIndex(b => b.id == bm.id);
            this.beatmaps[i] = bm;
            this.beatmap = bm;
            this.selectedMap = bm;
            this.info = null;
        },
        selfFilter: function() {
            this.filterValue = this.username;
            this.filter();
        },
        toggleInactive: function(e) {
            this.toggleInactiveBeatmaps = !this.toggleInactiveBeatmaps;
            this.loadBeatmaps(e);
        },

        // filters
        filter: function() {
            this.pageObjs = this.allObjs;

            //search
            if (this.filterValue.length > 2) {
                this.pageObjs = this.allObjs.filter(b => {
                    let valid = b.song.artist + ' ' + b.song.title + ' ' + b.host.username;
                    b.tasks.forEach(task => {
                        task.mappers.forEach(mapper => {
                            valid += ' ' + mapper.username;
                        });
                    });
                    valid = valid.toLowerCase();

                    let tags = this.filterValue
                        .toLowerCase()
                        .trim()
                        .split(' ');
                    let count = 0;
                    tags.forEach(tag => {
                        if (valid.includes(tag)) {
                            count++;
                        }
                    });

                    if (count == tags.length) {
                        return true;
                    }
                    return false;
                });
            }

            //mode
            if (this.filterMode.length) {
                if (this.isFiltered) {
                    this.pageObjs = this.pageObjs.filter(b => {
                        if (b.mode == this.filterMode) {
                            return true;
                        } else if (b.mode == 'hybrid') {
                            let value;
                            b.tasks.forEach(task => {
                                if (task.mode == this.filterMode) {
                                    value = true;
                                }
                            });
                            return value;
                        }
                        return false;
                    });
                } else {
                    this.pageObjs = this.allObjs.filter(b => {
                        if (b.mode == this.filterMode) {
                            return true;
                        } else if (b.mode == 'hybrid') {
                            let value;
                            b.tasks.forEach(task => {
                                if (task.mode == this.filterMode) {
                                    value = true;
                                }
                            });
                            return value;
                        }
                        return false;
                    });
                }
            }

            //status
            if (this.filterStatus.length) {
                if (this.isFiltered) {
                    this.pageObjs = this.pageObjs.filter(b => {
                        if (b.status == this.filterStatus) {
                            return true;
                        }
                        return false;
                    });
                } else {
                    this.pageObjs = this.allObjs.filter(b => {
                        if (b.status == this.filterStatus) {
                            return true;
                        }
                        return false;
                    });
                }
            }

            //quest
            if (this.filterQuest.length) {
                if (this.isFiltered) {
                    this.pageObjs = this.pageObjs.filter(b => {
                        if (this.filterQuest == 'none' && !b.quest) {
                            return true;
                        } else if (b.quest && b.quest.id == this.filterQuest) {
                            return true;
                        }
                        return false;
                    });
                } else {
                    this.pageObjs = this.allObjs.filter(b => {
                        if (this.filterQuest == 'none' && !b.quest) {
                            return true;
                        } else if (b.quest && b.quest.id == this.filterQuest) {
                            return true;
                        }
                        return false;
                    });
                }
            }

            this.isFiltered =
                this.filterValue.length > 2 ||
                this.filterMode.length ||
                this.filterStatus.length ||
                this.filterQuest.length;
            this.separateObjs();
        },
    },
    data() {
        return {
            allObjs: null,
            pageObjs: null,
            hostBeatmaps: null,
            guestDifficultyBeatmaps: null,
            workInProgressBeatmaps: null,
            pendingBeatmaps: null,
            qualifiedBeatmaps: null,
            rankedBeatmaps: null,
            selectedMap: null,
            userOsuId: null,
            username: null,
            usergroup: null,
            featuredArtists: null,
            featuredSongs: null,
            info: null,
            isLoading: false,
            filterValue: '',
            filterMode: '',
            filterStatus: '',
            filterQuest: '',
            isFiltered: false,
            toggleInactiveBeatmaps: false,
            allQuests: [],
        };
    },
    created() {
        axios
            .get('/beatmaps/relevantInfo')
            .then(response => {
                this.allObjs = response.data.beatmaps;
                this.pageObjs = response.data.beatmaps;
                this.userOsuId = response.data.userId;
                this.username = response.data.username;
                this.usergroup = response.data.group;
                this.filterMode = response.data.mainMode;
                this.separateObjs();
            })
            .then(function() {
                $('#loading').fadeOut();
                $('#app')
                    .attr('style', 'visibility: visible')
                    .hide()
                    .fadeIn();
            });
    },
};
</script>

<style>
.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}
</style>

