<template>
  <div class="my-2 col-sm-12 col-md-6 col-lg-4" @click="selectBeatmap()">
    <div
      class="card map-card bg-dark"
      :style="beatmap.quest ? 'border-left: ' + beatmap.quest.color + ' 4px solid;' : ''"
      data-toggle="modal"
      data-target="#editBeatmap"
      :data-mapid="beatmap.id"
    >
      <div
        class="card-status"
        :class="beatmap.status == 'WIP' ? 'card-status-wip' : beatmap.status == 'Done' ? 'card-status-done' : beatmap.status == 'Ranked' ? 'card-status-ranked' : 'card-status-qualified'"
      ></div>
      <img class="card-img" :src="processUrl(beatmap.url)" @error="fallbackImage($event)" style="opacity:0.5; overflow:hidden">
      <div class="card-img-overlay" style="padding: 0.50rem 0.50rem 0 0.50rem">
        <p
          class="card-title mb-1 text-shadow"
        >{{ formatMetadata(beatmap.song.artist, beatmap.song.title) }}</p>
        <small class="card-text text-shadow">
          <img
            v-if="beatmap.quest && beatmap.quest.art"
            class="rounded-circle mr-1"
            style="height:24px; width: 24px;"
            :src="beatmap.quest.art ? 'https://assets.ppy.sh/artists/' + beatmap.quest.art + '/cover.jpg' : '../../images/fa_icon.png'"
            data-toggle="tooltip"
            :title="beatmap.quest.name"
          >
          Hosted by
          <a
            :href="'https://osu.ppy.sh/users/' + beatmap.host.osuId"
            target="_blank"
            @click.stop
          >{{beatmap.host.username}}</a>
          <i v-if="beatmap.mode == 'taiko'" class="fas fa-drum"></i>
          <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt"></i>
          <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream"></i>
          <span
            class="font-weight-bold float-right pt-1"
            v-html="processDiffs(beatmap.tasks, beatmap.tasksLocked, beatmap.mode)"
          ></span>
        </small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'beatmap-card',
    props: ['beatmap', 'userOsuId'],
    data () {
        return {
            defaultUrl: 'https://osu.ppy.sh/images/layout/beatmaps/default-bg.png',
        }
    },
    methods: {
        fallbackImage: function(e) {
            e.target.src = this.defaultUrl;
        },
        selectBeatmap: function() {
            this.$emit('update:selectedMap', this.beatmap);
        },
        formatMetadata: function(artist, title) {
            let str = artist + ' - ' + title;
            if (str.length > 34) {
                return str.slice(0, 34) + '...';
            } else {
                return str;
            }
        },
        processUrl: function(beatmapUrl) {
            if (beatmapUrl && beatmapUrl.indexOf('osu.ppy.sh/beatmapsets/') !== -1) {
                let indexStart = beatmapUrl.indexOf('beatmapsets/') + 'beatmapsets/'.length;
                let indexEnd = beatmapUrl.indexOf('#');
                let idUrl;
                if (indexEnd !== -1) {
                    idUrl = beatmapUrl.slice(indexStart, indexEnd);
                } else {
                    idUrl = beatmapUrl.slice(indexStart);
                }

                return `https://assets.ppy.sh/beatmaps/${idUrl}/covers/card.jpg`;
            } else {
                return this.defaultUrl;
            }
        },
        processDiffs: function(tasks, tasksLocked, mode) {
            let diffsBlock = '';

            tasks.forEach(task => {
                    if(task.name == "Storyboard"){
                        diffsBlock += `<span class="px-1 text-shadow ${task.status.toLowerCase()}">SB</span>`
                    }
                });

            if(mode == "hybrid"){
                const modes = [
                    { name: 'osu', short: '<i class="far fa-circle"></i>', count: 0 },
                    { name: 'taiko', short: '<i class="fas fa-drum"></i>', count: 0 },
                    { name: 'catch', short: '<i class="fas fa-apple-alt"></i>', count: 0 },
                    { name: 'mania', short: '<i class="fas fa-stream"></i>', count: 0 }
                ];

                modes.forEach(mode => {
                    let modeStatus = 'done';
                    tasks.forEach(task => {
                        if(mode.name == task.mode) {
                            mode.count++;
                            if(task.status == 'WIP'){
                                modeStatus = 'wip';
                            }
                        }
                    });
                    diffsBlock += `<span class="px-1 text-shadow ${mode.count == 0 ? 'blocked' : modeStatus}" data-toggle="tooltip" data-placement="top" 
                        title="${mode.count > 0 ? mode.count : ''}">
                        ${mode.short}</span>`;

                });
                
            }else{
                const diffs = [
                    { name: 'Easy', short: 'E', count: 0 },
                    { name: 'Normal', short: 'N', count: 0 },
                    { name: 'Hard', short: 'H', count: 0 },
                    { name: 'Insane', short: 'I', count: 0 },
                    { name: 'Expert', short: 'X', count: 0 }
                ];
                if (tasks.length >= 10) {
                    let singleStatus;
                    diffs.forEach(diff => {
                        tasks.forEach(task => {
                            if (diff.name == task.name) {
                                diff.count++;
                                singleStatus = task.status.toLowerCase();
                            }
                        });
                        if (diff.count > 0) {
                            if (diff.count == 1) {
                                diffsBlock += `<span class="px-1 text-shadow ${singleStatus}">${
                                    diff.short
                                }</span>`;
                            } else {
                                diffsBlock += `<span class="px-1 text-shadow" data-toggle="tooltip" data-placement="top" title="${
                                    diff.count
                                }">${diff.short}${diff.count > 1 ? '+' : ''}</span>`;
                            }
                        } else if (tasksLocked.indexOf(diff.name) >= 0) {
                            diffsBlock += `<span class="px-1 text-shadow blocked">${diff.short}</span>`;
                        } else {
                            diffsBlock += `<span class="px-1 text-shadow open">${diff.short}</span>`;
                        }
                    });
                } else {
                    diffs.forEach(diff => {
                        let isClaimed = false;
                        let isUsed = false;
                        tasks.forEach(task => {
                            if (diff.name == task.name) {
                                diffsBlock += `<span class="px-1 text-shadow ${task.status.toLowerCase()}">${
                                    diff.short
                                }</span>`;

                                isClaimed = true;
                                isUsed = true;
                            }
                        });
                        tasksLocked.forEach(task => {
                            if (diff.name == task) {
                                if (!isClaimed) {
                                    diffsBlock += `<span class="px-1 text-shadow blocked">${
                                        diff.short
                                    }</span>`;
                                }

                                isUsed = true;
                            }
                        });
                        if (!isUsed) {
                            diffsBlock += `<span class="px-1 text-shadow open">${diff.short}</span>`;
                        }
                    });
                }
            }

            
            return diffsBlock;
        },
    },
};
</script>

<style>
    .map-card{
        overflow:hidden;
        height:75px;
    }
    
    .card-status {
        position: absolute;
        top: 0px;
        right: 0px;
        width: 0px;
        height: 0px;
        border-bottom: 15px solid transparent;
        z-index: 10000;
    }

    .card-status-open {
        border-right: 15px solid var(--open);
    }

    .card-status-wip {
        border-right: 15px solid var(--wip);
    }

    .card-status-done {
        border-right: 15px solid var(--done);
    }

    .card-status-qualified {
        border-right: 15px solid var(--guild);
    }

    .card-status-ranked {
        border-right: 15px solid var(--ranked);
    }
</style>

