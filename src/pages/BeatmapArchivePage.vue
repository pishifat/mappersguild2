<template>
    <div>
        <div class="container bg-container py-3 mb-2">
            <filter-box
                :filterValue.sync="filterValue"
                :filterMode.sync="filterMode"
                :filterQuest.sync="filterQuest"
                :all-quests="allQuests"
                @self-filter="selfFilter()"
            ></filter-box>
        </div>

        <div class="container bg-container py-3">
            <button
                :disabled="!(pre > 0)"
                class="btn btn-sm btn-mg mx-auto my-2"
                style="display:block"
                type="button"
                @click="showNewer()"
            >
                <i class="fas fa-angle-up mr-1"></i> show newer
                <i class="fas fa-angle-up ml-1"></i>
            </button>
            <div>
                <transition-group name="list" tag="div" class="row">
                    <beatmap-card
                        v-for="beatmap in beatmaps"
                        :key="beatmap.id"
                        :beatmap="beatmap"
                        @update:selectedMap="selectedMap = $event"
                    ></beatmap-card>
                </transition-group>
                <div class="small text-center mx-auto">{{ currentPage }} of {{ pages }}</div>
                <button
                    :disabled="!canShowOlder"
                    class="btn btn-sm btn-mg mx-auto my-2"
                    style="display:block"
                    type="button"
                    @click="showOlder()"
                >
                    <i class="fas fa-angle-down mr-1"></i> show older
                    <i class="fas fa-angle-down ml-1"></i>
                </button>
            </div>
        </div>

        <beatmap-info :beatmap="selectedMap"></beatmap-info>

        <notifications-access></notifications-access>
    </div>
</template>

<script>
import BeatmapCard from '../components/beatmaps/BeatmapCard.vue';
import BeatmapInfo from '../components/beatmaps/BeatmapInfo.vue';
import FilterBox from '../components/FilterBox.vue';
import NotificationsAccess from '../components/NotificationsAccess.vue';

export default {
    name: 'beatmap-archive-page',
    components: {
        BeatmapCard,
        BeatmapInfo,
        NotificationsAccess,
        FilterBox,
    },
    watch: {
        filterValue: function(v) {
            this.filter();
        },
        filterMode: function(v) {
            this.filter();
        },
        filterQuest: function(v) {
            this.filter();
        },
        limit: function() {
            this.limit = Math.round(this.limit);
            this.pre = this.limit - 24;
            if (this.allBeatmaps) {
                if (this.isFiltered) {
                    if (this.limit >= this.filteredBeatmaps.length) {
                        this.canShowOlder = false;
                    }
                    this.beatmaps = this.filteredBeatmaps.slice(this.pre, this.limit);
                    this.pages = Math.ceil(this.filteredBeatmaps.length / 24);
                } else {
                    if (this.limit >= this.allBeatmaps.length) {
                        this.canShowOlder = false;
                    }
                    this.beatmaps = this.allBeatmaps.slice(this.pre, this.limit);
                    this.pages = Math.ceil(this.allBeatmaps.length / 24);
                }
            }

            if (this.pages > 0) {
                this.currentPage = this.limit / 24;
            } else {
                this.currentPage = this.pages;
            }
        },
    },
    methods: {
        showOlder: function() {
            if (this.canShowOlder && this.beatmaps) {
                this.limit += 24;
            }
        },
        showNewer: function() {
            if (this.pre > 0 && this.beatmaps) {
                this.limit -= 24;
                this.canShowOlder = true;
            }
        },
        selfFilter: function() {
            this.filterValue = this.username;
            this.filter();
        },

        // filters
        filter: function() {
            this.filteredBeatmaps = this.allBeatmaps;

            //search
            if (this.filterValue.length > 2) {
                this.filteredBeatmaps = this.allBeatmaps.filter(b => {
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
                    this.filteredBeatmaps = this.filteredBeatmaps.filter(b => {
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
                    this.filteredBeatmaps = this.allBeatmaps.filter(b => {
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

            //quest
            if (this.filterQuest.length) {
                if (this.isFiltered) {
                    this.filteredBeatmaps = this.filteredBeatmaps.filter(b => {
                        if (this.filterQuest == 'none' && !b.quest) {
                            return true;
                        } else if (b.quest && b.quest.id == this.filterQuest) {
                            return true;
                        }
                        return false;
                    });
                } else {
                    this.filteredBeatmaps = this.allBeatmaps.filter(b => {
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
                this.filterValue.length > 2 || this.filterMode.length || this.filterQuest.length;
            this.limit = 24.01; //resets to first page
            this.canShowOlder = true;
        },
    },
    data() {
        return {
            username: null,
            beatmaps: null,
            allBeatmaps: null,
            filteredBeatmaps: null,
            selectedMap: null,
            info: null,
            canShowOlder: true,
            pre: null,
            limit: null,
            pages: null,
            currentPage: null,
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
            .get('/beatmapsarchive/relevantInfo')
            .then(response => {
                this.allBeatmaps = response.data.beatmaps;
                this.username = response.data.username;
                this.pre = 0;
                this.limit = 24;
                this.pages = Math.ceil(this.allBeatmaps.length / this.limit);
                this.currentPage = 1;

                if (this.limit >= this.allBeatmaps.length) {
                    this.canShowOlder = false;
                }

                let duplicate;
                this.allBeatmaps.forEach(b => {
                    if (b.quest && b.quest.name != duplicate) {
                        duplicate = b.quest.name;
                        this.allQuests.push({ id: b.quest.id, name: b.quest.name, art: b.quest.art });
                    }
                });
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
            axios.get('/beatmapsarchive/relevantInfo').then(response => {
                this.allBeatmaps = response.data.beatmaps;
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
