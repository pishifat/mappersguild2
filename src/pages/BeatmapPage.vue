<template>
    <div v-cloak>
        <div class="container bg-container py-3 mb-2">
            <filter-box
                :filter-value.sync="filterValue"
                :filter-mode.sync="filterMode"
                :filter-status.sync="filterStatus"
                :filter-quest.sync="filterQuest"
                :all-quests="allQuests"
                placeholder="song/username..."
                :is-loading.sync="isLoading"
                @self-filter="selfFilter()"
            >
                <button
                    class="btn btn-outline-info"
                    href="#"
                    data-toggle="modal"
                    data-target="#addBeatmap"
                    @click.prevent="openAddBeatmap()"
                >
                    Add beatmap <i class="fas fa-plus small" />
                </button>
            </filter-box>
        </div>

        <div class="container bg-container py-3">
            <h5 class="ml-2">
                <a href="#hostBeatmaps" data-toggle="collapse">
                    My mapsets ({{ hostBeatmaps ? hostBeatmaps.length : '...' }})
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
                    />
                </transition-group>
                <p v-if="!hostBeatmaps.length" class="ml-5 text-white-50">
                    None...
                </p>
            </div>
        </div>

        <div class="radial-divisor mx-auto my-4" />

        <div class="container bg-container py-3">
            <h5 class="ml-2">
                <a href="#guestDifficultyBeatmaps" data-toggle="collapse">
                    My guest difficulties ({{ guestDifficultyBeatmaps ? guestDifficultyBeatmaps.length : '...' }})
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
                    />
                </transition-group>
                <p v-if="!guestDifficultyBeatmaps.length" class="ml-5 text-white-50">
                    None...
                </p>
            </div>
        </div>

        <div class="radial-divisor mx-auto my-4" />

        <div class="container bg-container py-3">
            <h5 class="ml-2">
                <a href="#otherBeatmaps" data-toggle="collapse">
                    Other beatmaps ({{ otherBeatmaps ? otherBeatmaps.length : '...' }})
                    <i class="fas fa-angle-down" />
                </a>
                <span v-if="isLoading" class="text-white-50" style="font-size: 9pt;">loading...</span>
            </h5>
            <div v-if="otherBeatmaps" id="otherBeatmaps" class="collapse">
                <p v-if="!otherBeatmaps.length" class="ml-5 text-white-50">
                    None...
                </p>
                <beatmap-table-row
                    v-for="beatmap in otherBeatmaps"
                    :key="beatmap.id"
                    :beatmap="beatmap"
                    :user-osu-id="userOsuId"
                    @update:beatmap="updateBeatmap($event)"
                />
                <div class="text-center">
                    <button
                        class="btn btn-sm btn-outline-info my-4"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="toggle visibility of less active beatmaps"
                        @click.prevent="showMore($event)"
                    >
                        <i class="fas fa-angle-down mr-1" /> show older beatmaps <i class="fas fa-angle-down ml-1" />
                    </button>
                </div>
            </div>
        </div>

        <!-- beatmap info modal -->
        <div id="editBeatmap" class="modal fade" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div v-if="selectedMap" class="modal-content bg-dark">
                    <div class="modal-header text-dark" :class="'bg-' + selectedMap.status.toLowerCase()">
                        <h5 class="modal-title d-flex align-items-center">
                            <img
                                v-if="selectedMap.quest"
                                class="rounded-circle mr-1"
                                style="height:24px; width: 24px;"
                                :src="selectedMap.quest.art ? 'https://assets.ppy.sh/artists/' + selectedMap.quest.art + '/cover.jpg' : '../../images/fa_icon.png'"
                                data-toggle="tooltip"
                                :title="selectedMap.quest.name"
                            >

                            <span v-if="selectedMap.url">
                                <a :href="selectedMap.url" class="text-dark" target="_blank">
                                    <i class="fas fa-link" />
                                    {{ selectedMap.song.artist }} - {{ selectedMap.song.title }}
                                </a>
                            </span>
                            <span v-else>
                                {{ selectedMap.song.artist }} - {{ selectedMap.song.title }}
                            </span>

                            <a :href="'https://osu.ppy.sh/users/' + selectedMap.host.osuId" class="text-dark mx-1" target="_blank">({{ selectedMap.host.username }})</a>

                            <i
                                v-if="selectedMap.mode == 'taiko'"
                                class="fas fa-drum"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="osu!taiko"
                            />
                            <i
                                v-else-if="selectedMap.mode == 'catch'"
                                class="fas fa-apple-alt"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="osu!catch"
                            />
                            <i
                                v-else-if="selectedMap.mode == 'mania'"
                                class="fas fa-stream"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="osu!mania"
                            />
                            <i
                                v-else-if="selectedMap.mode == 'hybrid'"
                                class="fas fa-check-double"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="multiple game modes"
                            />
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
                            @update:beatmap="updateBeatmap($event)"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- create beatmap modal -->
        <create-beatmap
            :featured-artists="featuredArtists"
            :featured-songs="featuredSongs"
            :info="info"
        />

        <notifications-access v-if="usergroup != 'spectator'" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Axios from 'axios';
import $ from 'jquery';
import { Beatmap } from '../models/beatmap';
import CreateBeatmap from '../components/beatmaps/CreateBeatmap.vue';
import BeatmapCard from '../components/beatmaps/BeatmapCard.vue';
import BeatmapTableRow from '../components/beatmaps/BeatmapTableRow.vue';
import BeatmapInfo from '../components/beatmaps/beatmapInfo/BeatmapInfo.vue';
import FilterBox from '../components/FilterBox.vue';
import NotificationsAccess from '../components/NotificationsAccess.vue';
import { User, UserGroup } from '../models/user';
import { FeaturedSong } from '../models/featuredSong';
import { Quest } from '../models/quest';

export default Vue.extend({
    name: 'BeatmapPage',
    components: {
        CreateBeatmap,
        BeatmapCard,
        BeatmapTableRow,
        BeatmapInfo,
        FilterBox,
        NotificationsAccess,
    },
    data() {
        return {
            allObjs: [] as Beatmap[],
            pageObjs: [] as Beatmap[],
            hostBeatmaps: null as null | Beatmap[],
            guestDifficultyBeatmaps: null as null | Beatmap[],
            otherBeatmaps: null as null | Beatmap[],
            selectedMap: null as null | Beatmap,
            userOsuId: null as null | User['osuId'],
            username: '',
            usergroup: null as null | UserGroup,
            featuredArtists: null,
            featuredSongs: null as null | FeaturedSong,
            info: null as null | string,
            isLoading: false,
            firstLoadingComplete: false,
            filterValue: '',
            filterMode: '',
            filterStatus: '',
            filterQuest: '',
            isFiltered: false,
            daysCount: 30,
            allQuests: [] as Quest[],
            userMongoId: null as null | User['id'],
        };
    },
    computed: {
        displayDate(): string {
            const date = new Date;
            date.setDate(date.getDate() - this.daysCount);

            return date.toISOString().slice(0,10);
        },
    },
    watch: {
        filterValue(): void {
            this.filter();
        },
        filterMode(): void {
            this.loadBeatmaps();
        },
        filterStatus(): void {
            this.filter();
        },
        filterQuest(): void {
            this.filter();
        },
    },
    created() {
        Axios
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
            .then(() => {
                $('#loading').fadeOut();
                $('#app')
                    .attr('style', 'visibility: visible')
                    .hide()
                    .fadeIn();
            });
    },
    methods: {
        openAddBeatmap (): void {
            this.info = null;
            this.featuredSongs = null;
            $('input[type=checkbox]').each(function() {
                (this as any).checked = false;
            });

            if (!this.featuredArtists) {
                Axios.get('/beatmaps/artists').then(response => {
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
        async loadBeatmaps(e?): Promise<void> {
            if (e) e.target.disabled = true;
            let mode = this.filterMode;
            this.isLoading = true;
            if (!this.filterMode.length) mode = 'any';
            const response = await Axios.get('/beatmaps/loadBeatmaps/' + mode + '/' + this.daysCount);
            this.allObjs = response.data.statusBeatmaps.concat(response.data.guestDifficultyBeatmaps);
            this.pageObjs = this.allObjs;
            this.filter();
            this.isLoading = false;
            this.firstLoadingComplete = true;
            if (e) e.target.disabled = false;
        },
        separateObjs(): void {
            this.hostBeatmaps = [];
            this.guestDifficultyBeatmaps = [];
            this.otherBeatmaps = [];
            this.pageObjs.forEach(beatmap => {
                if (beatmap.host.id == this.userMongoId) {
                    this.hostBeatmaps?.push(beatmap);
                } else if ((beatmap.mappers as User['id'][]).includes(this.userMongoId as User['id'])) {
                    this.guestDifficultyBeatmaps?.push(beatmap);
                } else {
                    this.otherBeatmaps?.push(beatmap);
                }
            });
        },
        updateBeatmap(bm): void {
            const i = this.allObjs.findIndex(b => b.id == bm.id);
            this.allObjs[i] = bm;
            this.selectedMap = bm;
            this.info = null;
            this.filter();
        },
        selfFilter(): void {
            this.filterValue = this.username;
            this.filter();
        },
        async showMore(e): Promise<void> {
            this.daysCount += 30;
            await this.loadBeatmaps(e);
        },

        // filters
        filter(): void {
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

                    const tags = this.filterValue
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
                this.filterMode.length > 0 ||
                this.filterStatus.length > 0 ||
                this.filterQuest.length > 0;
            this.separateObjs();
        },
    },
});
</script>

<style>
.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}
</style>
