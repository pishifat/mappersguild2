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
            <h5 class="ml-4">
                <a href="#hostMaps" data-toggle="collapse" >
                    My mapsets ({{hostMaps ? hostMaps.length : '...'}})
                    <i class="fas fa-angle-down" />
                </a>
            </h5>
            <div id="hostMaps" class="show">
                <transition-group name="list" tag="div" class="row">
                    <beatmap-card
                        v-for="beatmap in hostMaps"
                        :key="beatmap.id"
                        :beatmap="beatmap"
                        :user-osu-id="userOsuId"
                        @update:selectedMap="selectedMap = $event"
                    ></beatmap-card>
                </transition-group>
            </div>
            <h5 class="ml-4 mt-2">
                <a href="#guestDifficultyMaps" data-toggle="collapse" >
                    My guest difficulties ({{guestDifficultyMaps ? guestDifficultyMaps.length : '...'}})
                    <i class="fas fa-angle-down" />
                </a>
            </h5>
            <div id="guestDifficultyMaps" class="show">
                <transition-group name="list" tag="div" class="row">
                    <beatmap-card
                        v-for="beatmap in guestDifficultyMaps"
                        :key="beatmap.id"
                        :beatmap="beatmap"
                        :user-osu-id="userOsuId"
                        @update:selectedMap="selectedMap = $event"
                    ></beatmap-card>
                </transition-group>
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
            let mode = this.filterMode;
            this.filter();
            this.isLoading = true;
            if(!this.filterMode.length) mode = 'any';
            axios
                .get('/beatmaps/loadBeatmaps/' + mode)
                .then(response => {
                    this.allObjs = response.data.beatmaps;
                    this.pageObjs = response.data.beatmaps;
                    this.filter();
                    this.isLoading = false;
            })
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
        separateObjs: function() {
            this.hostMaps = [];
            this.guestDifficultyMaps = [];
            this.pageObjs.forEach(beatmap => {
                if(beatmap.host.osuId == this.userOsuId){
                    this.hostMaps.push(beatmap);
                }else{
                    let breakLoop = false;
                    for (let i = 0; i < beatmap.tasks.length; i++) {
                        const task = beatmap.tasks[i];
                        for (let j = 0; j < task.mappers.length; j++) {
                            const mapper = task.mappers[j];
                            if(mapper.osuId == this.userOsuId){
                                this.guestDifficultyMaps.push(beatmap);
                                breakLoop = true;
                                break;
                            }
                        }
                        if(breakLoop){
                            break;
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
            hostMaps: null,
            guestDifficultyMaps: null,
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
    mounted() {
        setInterval(() => {
            axios.get('/beatmaps/relevantInfo').then(response => {
                this.allObjs = response.data.beatmaps;
                if (this.isFiltered) {
                    this.filter();
                }
            });
        }, 300000);
    },
};
</script>

<style>
</style>
