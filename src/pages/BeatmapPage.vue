<template>
  <div class="row">
    <div class="col-lg-12">
      <div class="row">
        <h2>Work-in-progress/Pending
          <button
            class="btn btn-mg"
            data-toggle="modal"
            data-target="#addBeatmap"
            @click="openAddBeatmap()"
          >Add beatmap</button>
        </h2>
      </div>
      <div class="row col-md-12 pb-2">
        <small>
          Search:
          <input
            id="search"
            v-model="filterValue"
            type="text"
            placeholder="song, username or quest... (3+ characters)"
            style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000); width: 266px;"
          >
        </small>
      </div>

      <button
        :disabled="!(pre > 0 && filterValue.length < 3)"
        class="btn btn-sm btn-mg mx-auto my-2"
        style="display:block"
        type="button"
        @click="showNewer()"
      >
        <i class="fas fa-angle-up mr-1"></i> show newer
        <i class="fas fa-angle-up ml-1"></i>
      </button>
      <div id="wipAndPendingBeatmaps">
        <transition-group name="list" tag="div" class="row">
          <beatmap-card
            v-for="beatmap in beatmaps"
            :key="beatmap.id"
            :beatmap="beatmap"
            :user-osu-id="userOsuId"
            @update:selectedMap="selectedMap = $event"
          ></beatmap-card>
        </transition-group>
        <div
          class="small text-center mx-auto"
          v-if="filterValue.length < 3"
        >{{currentPage}} of {{pages}}</div>
        <button
          :disabled="!(canShowOlder && filterValue.length < 3)"
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

    <beatmap-info :beatmap="selectedMap" :user-osu-id="userOsuId" @update-map="updateMap($event)"></beatmap-info>
    <create-beatmap
      :featured-artists="featuredArtists"
      :featured-songs="featuredSongs"
      :info="info"
    ></create-beatmap>
    <notifications-access></notifications-access>
  </div>
</template>

<script>
import CreateBeatmap from '../components/beatmaps/CreateBeatmap.vue';
import BeatmapCard from '../components/beatmaps/BeatmapCard.vue';
import BeatmapInfo from '../components/beatmaps/BeatmapInfo.vue';
import NotificationsAccess from '../components/NotificationsAccess.vue';

export default {
    name: 'beatmap-page',
    components: {
        CreateBeatmap,
        BeatmapCard,
        BeatmapInfo,
        NotificationsAccess,
    },
    watch: {
        filterValue: function(v) {
            if (v.length > 2) {
                this.filter();
            } else {
                this.limit += 0.01; //decimal activates the watch without actually affecting limit
            }
        },
        limit: function() {
            this.limit = Math.round(this.limit);
            this.pre = this.limit - 24;
            this.currentPage = this.limit / 24;
            if (this.beatmaps) {
                if (this.limit >= this.allBeatmaps.length) {
                    this.canShowOlder = false;
                }
                this.beatmaps = this.allBeatmaps.slice(this.pre, this.limit);
            }
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
        updateMap: function(bm) {
            const i = this.beatmaps.findIndex(b => b.id == bm.id);
            this.beatmaps[i] = bm;
            this.beatmap = bm;
            this.selectedMap = bm;
            this.info = null;
        },

        // filters
        filter: function() {
            this.filterValue = $('#search').val();
            this.beatmaps = this.allBeatmaps;
            if (this.filterValue.length > 2) {
                this.beatmaps = this.beatmaps.filter(b => {
                    let valid = b.song.title + ' ' + b.song.artist + ' ' + b.host.username;
                    valid += b.quest ? ' ' + b.quest.name : '';

                    b.tasks.forEach(task => {
                        task.mappers.forEach(mapper => {
                            valid += ' ' + mapper.username;
                        });
                    });

                    if (
                        valid
                            .toLowerCase()
                            .trim()
                            .indexOf(this.filterValue.toLowerCase().trim()) > -1
                    ) {
                        return true;
                    }
                    return false;
                });
            }
        },
    },
    data() {
        return {
            beatmaps: null,
            allBeatmaps: null,
            selectedMap: null,
            userOsuId: null,
            featuredArtists: null,
            featuredSongs: null,
            info: null,
            filterValue: '',

            limit: null,
            pre: null,
            currentPage: null,
            pages: null,
            canShowOlder: true,
        };
    },
    created() {
        axios
            .get('/beatmaps/relevantInfo')
            .then(response => {
                this.beatmaps = response.data.beatmaps;
                this.allBeatmaps = response.data.beatmaps;
                this.userOsuId = response.data.userId;
                this.pre = 0;
                this.limit = 24;
                this.pages = Math.ceil(this.allBeatmaps.length / this.limit);
                this.currentPage = 1;
                if (this.limit >= this.allBeatmaps.length) {
                    this.canShowOlder = false;
                }
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
                this.allBeatmaps = response.data.beatmaps;
                if (this.filterValue.length > 2) {
                    this.filter();
                }
            });
        }, 30000);
    },
};
</script>

<style>
</style>
