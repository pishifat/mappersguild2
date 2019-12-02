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
            <h5 class="ml-2">
                <a href="#hostBeatmaps" data-toggle="collapse" >
                    My mapsets ({{hostBeatmaps ? hostBeatmaps.length : '...'}})
                    <i class="fas fa-angle-down" />
                </a>
                <span v-if="isLoading && firstLoadingComplete" class="text-white-50" style="font-size: 9pt;">loading...</span>
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
        </div>

        <div class="radial-divisor mx-auto my-4"></div>

        <div class="container bg-container py-3">
            <h5 class="ml-2">
                <a href="#guestDifficultyBeatmaps" data-toggle="collapse" >
                    My guest difficulties ({{guestDifficultyBeatmaps ? guestDifficultyBeatmaps.length : '...'}}) 
                    <i class="fas fa-angle-down" />
                </a>
                <span v-if="isLoading" class="text-white-50" style="font-size: 9pt;">loading...</span>
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
            <h5 class="ml-2">
                <a href="#otherBeatmaps" data-toggle="collapse" >
                    Other beatmaps ({{otherBeatmaps ? otherBeatmaps.length : '...'}})
                    <i class="fas fa-angle-down" />
                </a>
                <span v-if="isLoading" class="text-white-50" style="font-size: 9pt;">loading...</span>
            </h5>
            <div v-if="otherBeatmaps" id="otherBeatmaps" class="collapse">
                <table v-if="otherBeatmaps.length" class="table table-dark table-hover col-md-12 mt-2">
                    <thead>
                        <td scope="col">
                            Mapset
                        </td>
                        <td scope="col">
                            Quest
                        </td>
                        <td scope="col">
                            Host
                        </td>
                        <td scope="col">
                            Difficulties
                        </td>
                    </thead>
                    <beatmap-table-row
                        v-for="beatmap in otherBeatmaps"
                        :key="beatmap.id"
                        :beatmap="beatmap"
                        :user-osu-id="userOsuId"
                        @update:selectedMap="selectedMap = $event"
                    ></beatmap-table-row>
                </table>
                <p v-else class="ml-5 text-white-50">None...</p>
                <div class="text-center">
                    <button class="btn btn-sm btn-outline-info mx-2" @click.prevent="showMore($event)" data-toggle="tooltip" data-placement="top" title="toggle visibility of less active beatmaps">
                        <i class="fas fa-angle-down mr-1"></i> show older beatmaps<i class="fas fa-angle-down ml-1"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- beatmap info modal -->
        <div id="editBeatmap" class="modal fade" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content bg-dark" v-if="selectedMap">
                    <div class="modal-header text-dark" :class="'bg-' + selectedMap.status.toLowerCase()">
                        <h5 class="modal-title">
                            <span v-if="selectedMap.url">
                                <a :href="selectedMap.url" class="text-dark" target="_blank">
                                    {{ selectedMap.song.artist }} - {{ selectedMap.song.title }}
                                </a>
                            </span>
                            <span v-else>
                                {{ selectedMap.song.artist }} - {{ selectedMap.song.title }}
                            </span>
                            (<a :href="'https://osu.ppy.sh/users/' + selectedMap.host.osuId" class="text-dark" target="_blank">{{ selectedMap.host.username }}</a>)
                            <i v-if="selectedMap.mode == 'taiko'" class="fas fa-drum"></i>
                            <i v-else-if="selectedMap.mode == 'catch'" class="fas fa-apple-alt"></i>
                            <i v-else-if="selectedMap.mode == 'mania'" class="fas fa-stream"></i>
                        </h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" style="overflow: hidden;">
                        <img src="../images/the_A.png" class="the-a-background">
                        <beatmap-info
                            :beatmap="selectedMap"
                            :user-osu-id="userOsuId"
                            @update-map="updateBeatmap($event)"
                        >
                        </beatmap-info>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- create beatmap modal -->
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
import BeatmapTableRow from '../components/beatmaps/BeatmapTableRow.vue';
import BeatmapInfo from '../components/beatmaps/BeatmapInfo.vue';
import FilterBox from '../components/FilterBox.vue';
import NotificationsAccess from '../components/NotificationsAccess.vue';

export default {
    name: 'beatmap-page',
    components: {
        CreateBeatmap,
        BeatmapCard,
        BeatmapTableRow,
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
    computed: {
        displayDate: function() {
            let date = new Date;
            date.setDate(date.getDate() - this.daysCount);
            return date.toISOString().slice(0,10);
        }
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
            this.isLoading = true;
            if(!this.filterMode.length) mode = 'any';
            axios
                .get('/beatmaps/loadBeatmaps/' + mode + '/' + this.daysCount)
                .then(response => {
                    this.allObjs = response.data.statusBeatmaps.concat(response.data.guestDifficultyBeatmaps);
                    this.pageObjs = this.allObjs;
                    this.filter();
                    this.isLoading = false;
                    this.firstLoadingComplete = true;
                    if (e) e.target.disabled = false;
            })
        },
        separateObjs: function() {
            this.hostBeatmaps = [];
            this.guestDifficultyBeatmaps = [];
            this.otherBeatmaps = [];
            this.pageObjs.forEach(beatmap => {
                if(beatmap.host.id == this.userMongoId){
                    this.hostBeatmaps.push(beatmap);
                }else if(beatmap.mappers.includes(this.userMongoId)){
                    this.guestDifficultyBeatmaps.push(beatmap);
                }else{
                    this.otherBeatmaps.push(beatmap);
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
        updateBeatmap: function(bm) {
            const i = this.allObjs.findIndex(b => b.id == bm.id);
            this.allObjs[i] = bm;
            this.selectedMap = bm;
            this.info = null;
            this.filter();
        },
        selfFilter: function() {
            this.filterValue = this.username;
            this.filter();
        },
        showMore: async function(e) {
            this.daysCount += 30;
            await this.loadBeatmaps(e);
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
            otherBeatmaps: null,
            selectedMap: null,
            userOsuId: null,
            username: null,
            usergroup: null,
            featuredArtists: null,
            featuredSongs: null,
            info: null,
            isLoading: false,
            firstLoadingComplete: false,
            filterValue: '',
            filterMode: '',
            filterStatus: '',
            filterQuest: '',
            isFiltered: false,
            daysCount: 30,
            allQuests: [],
        };
    },
    created() {
        axios
            .get('/beatmaps/relevantInfo')
            .then(response => {
                this.allObjs = response.data.beatmaps;
                this.pageObjs = response.data.beatmaps;
                this.userOsuId = response.data.userOsuId;
                this.userMongoId = response.data.userMongoId;
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

