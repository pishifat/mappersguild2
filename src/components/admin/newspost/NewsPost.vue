<template>
    <div id="newsPost" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content bg-dark">
                <div class="modal-header text-dark bg-rest">
                    <h5 class="modal-title">
                        Generate news post
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <p>
                        <button class="btn btn-sm btn-outline-info" @click="loadNewsInfo($event)">
                            Load beatmap and quest data
                        </button>
                        <input
                            v-model="date"
                            class="form-control-sm mx-2 w-25"
                            type="text"
                            autocomplete="off"
                            placeholder="YYYY-MM-DD"
                        >
                    </p>
                    <p v-if="quests">
                        Quest data:
                    </p>
                    <div v-if="quests" class="copy-paste">
                        <span v-for="quest in quests" :key="quest.id">
                            <br><samp class="small text-white-50">
                                {{ quest.art && quest.associatedMaps.length ?
                                    '![' + quest.associatedMaps[0].song.artist + ' header](https://assets.ppy.sh/artists/' + quest.art + '/header.jpg)' :
                                    '![Mystery header](/wiki/shared/news/banners/mappersguild-mystery.jpg)' }}
                            </samp><br><br>
                            <samp class="small text-white-50">
                                For the **{{ quest.name + ' (' + questModes(quest.modes) + ')' }}** quest, the mapper{{ quest.completedMembers.length == 1 ? '' : 's' }} had to {{ quest.descriptionMain.substring(0,1).toLowerCase() + quest.descriptionMain.substring(1) }}
                            </samp><br><br>
                            <samp class="small text-white-50">
                                This quest was completed by
                                <span v-for="(member, i) in quest.completedMembers" :key="member.id">
                                    **[{{ member.username }}]({{ 'https://osu.ppy.sh/users/' + member.osuId }})**{{ separateUsername(i, quest.completedMembers.length) }}
                                </span>
                            </samp><br><br>
                            <span v-for="beatmap in quest.associatedMaps" :key="beatmap.id">
                                <samp class="small text-white-50">
                                    - [{{ beatmap.song.artist }} - {{ beatmap.song.title }}]({{ beatmap.url }})
                                    {{ beatmap.mappers.length > 1 ? 'hosted by' : 'by' }}
                                    [{{ beatmap.host.username }}]({{ 'https://osu.ppy.sh/users/' + beatmap.host.osuId }})
                                    <span v-if="quest.modes.length > 1">
                                        ({{ beatmap.mode == 'osu' ? 'osu!' : beatmap.mode == 'hybrid' ? 'hybrid' : 'osu!' + beatmap.mode }})
                                    </span>
                                </samp><br>
                            </span>
                        </span>
                    </div>
                    <p v-if="beatmaps">
                        Other beatmap data:
                    </p>
                    <div v-if="beatmaps" class="copy-paste">
                        <samp class="small text-white-50">
                            [**osu!**](#osu)
                        </samp><br>
                        <beatmap-list
                            :beatmaps="osuBeatmaps"
                            :display-mode="'osu!'"
                            :raw-mode="'osu'"
                        />
                        <samp class="small text-white-50">
                            [**osu!taiko**](#taiko)
                        </samp><br>
                        <beatmap-list
                            :beatmaps="taikoBeatmaps"
                            :display-mode="'osu!taiko'"
                            :raw-mode="'taiko'"
                        />
                        <samp class="small text-white-50">
                            [**osu!catch**](#catch)
                        </samp><br>
                        <beatmap-list
                            :beatmaps="catchBeatmaps"
                            :display-mode="'osu!catch'"
                            :raw-mode="'catch'"
                        />
                        <samp class="small text-white-50">
                            [**osu!mania**](#mania)
                        </samp><br>
                        <beatmap-list
                            :beatmaps="maniaBeatmaps"
                            :display-mode="'osu!mania'"
                            :raw-mode="'mania'"
                        />
                        <samp class="small text-white-50">
                            [**multiple modes**](#hybrid)
                        </samp><br><br>
                        <beatmap-list
                            :beatmaps="hybridBeatmaps"
                            :display-mode="'multiple modes'"
                            :raw-mode="'hybrid'"
                        />
                        <samp class="small text-white-50">
                            EXTERNAL BEATMAPS (sort these on your own)
                        </samp><br>
                        <span v-for="beatmap in externalBeatmaps" :key="beatmap.osuId">
                            <samp class="small text-white-50">
                                - [{{ beatmap.artist }} - {{ beatmap.title }}]({{ 'https://osu.ppy.sh/beatmapsets/' + beatmap.osuId }})
                                hosted by
                                [{{ beatmap.creator }}]({{ 'https://osu.ppy.sh/users/' + beatmap.creatorOsuId }})
                            </samp><br>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';
import { Quest } from '../../../../interfaces/quest';
import BeatmapList from './BeatmapList.vue';

export default Vue.extend({
    name: 'NewsPost',
    components: {
        BeatmapList,
    },
    data() {
        return {
            date: '2019-11-29',
            beatmaps: [] as Beatmap[],
            quests: [] as Quest[],
            externalBeatmaps: [] as any,
        };
    },
    computed: {
        osuBeatmaps(): Beatmap[] {
            return this.beatmaps.filter(b => b.mode == 'osu');
        },
        taikoBeatmaps(): Beatmap[] {
            return this.beatmaps.filter(b => b.mode == 'taiko');
        },
        catchBeatmaps(): Beatmap[] {
            return this.beatmaps.filter(b => b.mode == 'catch');
        },
        maniaBeatmaps(): Beatmap[] {
            return this.beatmaps.filter(b => b.mode == 'mania');
        },
        hybridBeatmaps(): Beatmap[] {
            return this.beatmaps.filter(b => b.mode == 'hybrid');
        },
    },
    methods: {
        async loadNewsInfo(e): Promise<void> {
            const res: any = await this.executeGet('/admin/beatmaps/loadNewsInfo/' + this.date, e);

            if (res) {
                this.beatmaps = res.beatmaps;
                this.quests = res.quests;
                this.externalBeatmaps = res.externalBeatmaps;
            }
        },
        questModes(modes): string {
            let text = '';

            for (let i = 0; i < modes.length; i++) {
                const mode = modes[i];

                if (mode == 'osu') {
                    text += 'osu!';
                } else {
                    text += 'osu!' + mode;
                }

                if (i < modes.length - 1) {
                    text += ', ';
                }
            }

            return text;
        },
        separateUsername(i, length): string {
            if (i < length - 2) {
                return ', ';
            } else if (i < length - 1) {
                return ' and';
            } else {
                return '';
            }
        },
    },
});
</script>