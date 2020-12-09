<template>
    <modal-dialog id="newsPost" title="Generate news post">
        <p>
            <button class="btn btn-sm btn-outline-info" @click="loadNewsInfo($event)">
                Load beatmap and quest data
            </button>
            <input
                v-model="date"
                class="form-control form-control-sm mx-2 w-25"
                type="text"
                autocomplete="off"
                placeholder="YYYY-MM-DD"
            >
        </p>

        <p>
            notes to self from last news post:
            - for the repeat packs (double, mini-pack, etc) they don't need to state the exact objective each time. too repetitive
            - separate quests by type (special, big pack, mini pack, solo)
            - not sure what to do about ranked maps list (probably too big each time? users is cool at least)
        </p>

        <p v-if="quests">
            Quest data:
        </p>

        <copy-paste v-if="quests" :distinct="'quests'">
            <div v-for="quest in quests" :key="quest.id">
                <p>
                    {{ quest.art && quest.associatedMaps.length ?
                        '![' + quest.associatedMaps[0].song.artist + ' header](https://assets.ppy.sh/artists/' + quest.art + '/header.jpg)' :
                        '![Mystery header](/wiki/shared/news/banners/mappersguild-mystery.jpg)' }}
                </p>
                <p>
                    For the **{{ quest.name + ' (' + questModes(quest.modes) + ')' }}** quest, the mapper{{ quest.completedMembers.length == 1 ? '' : 's' }} had to {{ quest.descriptionMain.substring(0,1).toLowerCase() + quest.descriptionMain.substring(1) }}
                </p>
                <p>
                    This quest was completed by
                    <span v-for="(member, i) in quest.completedMembers" :key="member.id">
                        **[{{ member.username }}]({{ 'https://osu.ppy.sh/users/' + member.osuId }})**{{ separateUsername(i, quest.completedMembers.length) }}
                    </span>
                </p>
                <div v-for="beatmap in quest.associatedMaps" :key="beatmap.id">
                    - [{{ beatmap.song.artist }} - {{ beatmap.song.title }}]({{ beatmap.url }})
                    {{ hasMultipleMappers(beatmap.tasks) ? 'hosted by' : 'by' }}
                    [{{ beatmap.host.username }}]({{ 'https://osu.ppy.sh/users/' + beatmap.host.osuId }})
                    <span v-if="quest.modes.length > 1">
                        ({{ beatmap.mode == 'osu' ? 'osu!' : beatmap.mode == 'hybrid' ? 'hybrid' : 'osu!' + beatmap.mode }})
                    </span>
                </div>
                <br>
            </div>
        </copy-paste>

        <p v-if="beatmaps">
            Other beatmap data:
        </p>

        <copy-paste v-if="beatmaps" :distinct="'beatmaps'">
            <div>[**osu!**](#osu)</div>
            <div>[**osu!taiko**](#taiko)</div>
            <div>[**osu!catch**](#catch)</div>
            <div>[**osu!mania**](#mania)</div>
            <div>[*Multiple mode mapsets**](#hybrid)</div>
            <br>
            <beatmap-list
                :beatmaps="osuBeatmaps"
                :display-mode="'osu!'"
                :raw-mode="'osu'"
            />
            <beatmap-list
                :beatmaps="taikoBeatmaps"
                :display-mode="'osu!taiko'"
                :raw-mode="'taiko'"
            />
            <beatmap-list
                :beatmaps="catchBeatmaps"
                :display-mode="'osu!catch'"
                :raw-mode="'catch'"
            />
            <beatmap-list
                :beatmaps="maniaBeatmaps"
                :display-mode="'osu!mania'"
                :raw-mode="'mania'"
            />
            <beatmap-list
                :beatmaps="hybridBeatmaps"
                :display-mode="'multiple modes'"
                :raw-mode="'hybrid'"
            />
        </copy-paste>

        <p v-if="externalBeatmaps">
            External beatmaps (sort these manually):
        </p>

        <copy-paste v-if="externalBeatmaps" :distinct="'external'">
            <div v-for="beatmap in externalBeatmaps" :key="beatmap.osuId">
                - [{{ beatmap.artist }} - {{ beatmap.title }}]({{ 'https://osu.ppy.sh/beatmapsets/' + beatmap.osuId }})
                hosted by
                [{{ beatmap.creator }}]({{ 'https://osu.ppy.sh/users/' + beatmap.creatorOsuId }})
            </div>
        </copy-paste>

        <p v-if="users">
            Users with ranked maps/tasks:
        </p>

        <copy-paste v-if="users" :distinct="'users'">
            <div>
                | User | Beatmaps Ranked | Difficulties Ranked |
            </div>
            <div>
                | :-- | :-- | :-- |
            </div>
            <div v-for="user in users" :key="user.id">
                | [{{ user.username }}]({{ 'https://osu.ppy.sh/users/' + user.osuId }}) | {{ user.hostCount }} | {{ user.taskCount }} |
            </div>
        </copy-paste>
    </modal-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';
import { Quest } from '../../../../interfaces/quest';
import BeatmapList from './BeatmapList.vue';
import CopyPaste from '../../CopyPaste.vue';
import ModalDialog from '@components/ModalDialog.vue';

export default Vue.extend({
    name: 'NewsPost',
    components: {
        BeatmapList,
        CopyPaste,
        ModalDialog,
    },
    data() {
        return {
            date: '2020-03-23',
            beatmaps: [] as Beatmap[],
            quests: [] as Quest[],
            externalBeatmaps: [] as any,
            users: [] as any,
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
                this.users = res.users;
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
        hasMultipleMappers(tasks): boolean {
            const mappers: string[] = [];
            tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if (!mappers.includes(mapper)) {
                        mappers.push(mapper);
                    }
                });
            });
            if (mappers.length > 1) return true;
            else return false;
        },
    },
});
</script>