<template>
    <div id="extendedInfo" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div v-if="selectedUser" class="modal-content bg-dark">
                <div class="modal-header text-dark" :class="'bg-rank-' + selectedUser.rank">
                    <h5 class="modal-title">
                        <a :href="'https://osu.ppy.sh/users/' + selectedUser.osuId" class="text-dark" target="_blank">
                            {{ selectedUser.username }}
                        </a>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <img src="../../images/the_A.png" class="the-a-background">
                    <div class="row col-lg-12">
                        <table class="table table-sm table-dark table-hover col-md-6">
                            <thead>
                                <td scope="col">
                                    Task
                                </td>
                                <td scope="col">
                                    Points
                                </td>
                            </thead>
                            <tbody>
                                <user-points-row
                                    v-if="selectedUser.easyPoints"
                                    :points="selectedUser.easyPoints"
                                    :display="'mapping Easy difficulties'"
                                    :tooltip-title="'~5 points per difficulty. +2 if quest mapset'"
                                />
                                <user-points-row
                                    v-if="selectedUser.normalPoints"
                                    :points="selectedUser.normalPoints"
                                    :display="'mapping Normal difficulties'"
                                    :tooltip-title="'~6 points per difficulty. +2 if quest mapset'"
                                />
                                <user-points-row
                                    v-if="selectedUser.hardPoints"
                                    :points="selectedUser.hardPoints"
                                    :display="'mapping Hard difficulties'"
                                    :tooltip-title="'~7 points per difficulty. +2 if quest mapset'"
                                />
                                <user-points-row
                                    v-if="selectedUser.insanePoints"
                                    :points="selectedUser.insanePoints"
                                    :display="'mapping Insane difficulties'"
                                    :tooltip-title="'~8 points per difficulty. +2 if quest mapset'"
                                />
                                <user-points-row
                                    v-if="selectedUser.expertPoints"
                                    :points="selectedUser.expertPoints"
                                    :display="'mapping Expert difficulties'"
                                    :tooltip-title="'~8 points per difficulty. +2 if quest mapset'"
                                />
                                <user-points-row
                                    v-if="selectedUser.storyboardPoints"
                                    :points="selectedUser.storyboardPoints"
                                    :display="'creating storyboards'"
                                    :tooltip-title="'2, 7.5, or 10 points per storyboard'"
                                />
                                <user-points-row
                                    v-if="selectedUser.questPoints"
                                    :points="selectedUser.questPoints"
                                    :display="'completing quests'"
                                    :tooltip-title="'5 bonus points for completing quests on time'"
                                />
                                <user-points-row
                                    v-if="selectedUser.modPoints"
                                    :points="selectedUser.modPoints"
                                    :display="'modding mapsets'"
                                    :tooltip-title="'1 point per mod'"
                                />
                                <user-points-row
                                    v-if="selectedUser.hostPoints"
                                    :points="selectedUser.hostPoints"
                                    :display="'hosting mapsets'"
                                    :tooltip-title="'5 points per mapset hosted'"
                                />
                                <user-points-row
                                    v-if="selectedUser.contestParticipantPoints"
                                    :points="selectedUser.contestParticipantPoints"
                                    :display="'MBC participation'"
                                    :tooltip-title="'participation in Monthly Beatmapping Contests'"
                                />
                                <user-points-row
                                    v-if="selectedUser.contestJudgePoints"
                                    :points="selectedUser.contestJudgePoints"
                                    :display="'MBC screening'"
                                    :tooltip-title="'screening entries for Monthly Beatmapping Contests'"
                                />
                                <user-points-row
                                    v-if="selectedUser.contestVotePoints"
                                    :points="selectedUser.contestVotePoints"
                                    :display="'MBC voting'"
                                    :tooltip-title="'voting in Monthly Beatmapping Contests'"
                                />
                                <user-points-row
                                    v-if="selectedUser.legacyPoints"
                                    :points="selectedUser.legacyPoints"
                                    :display="'legacy'"
                                    :tooltip-title="'points for things that are no longer applicable to Mappers\' Guild'"
                                />
                                <user-points-row
                                    v-if="selectedUser.osuPoints"
                                    :points="selectedUser.osuPoints"
                                    :display="'Total osu! points'"
                                    :tooltip-title="'mapping osu! game mode'"
                                />
                                <user-points-row
                                    v-if="selectedUser.taikoPoints"
                                    :points="selectedUser.taikoPoints"
                                    :display="'Total osu!taiko points'"
                                    :tooltip-title="'mapping osu!taiko game mode'"
                                />
                                <user-points-row
                                    v-if="selectedUser.catchPoints"
                                    :points="selectedUser.catchPoints"
                                    :display="'Total osu!catch points'"
                                    :tooltip-title="'mapping osu!catch game mode'"
                                />
                                <user-points-row
                                    v-if="selectedUser.maniaPoints"
                                    :points="selectedUser.maniaPoints"
                                    :display="'Total osu!mania points'"
                                    :tooltip-title="'mapping osu!mania game mode'"
                                />
                                <tr>
                                    <td scope="row">
                                        Total points earned
                                    </td>
                                    <td scope="row">
                                        {{ selectedUser.totalPoints }}
                                    </td>
                                </tr>
                                <tr>
                                    <td scope="row">
                                        Available points
                                    </td>
                                    <td scope="row">
                                        {{ selectedUser.availablePoints }} <i class="fas fa-coins" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="col-md-6">
                            <p
                                class="small"
                            >
                                Rank:
                                <i
                                    v-if="selectedUser.rank > 0"
                                    class="fas fa-crown"
                                    :class="selectedUser.rank == 1 ? 'text-rank-1' : selectedUser.rank == 2 ? 'text-rank-2' : 'text-rank-3'"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    :title="selectedUser.rank == 1 ? 'rank 1 user' : selectedUser.rank == 2 ? 'rank 2 user' : 'rank 3 user'"
                                />
                                <span v-else class="text-white-50">
                                    None
                                </span>
                            </p>
                            <p v-if="currentQuests.length" class="small min-spacing">
                                Current Quests:
                            </p>
                            <ul class="min-spacing mb-2 ml-4">
                                <li
                                    v-for="quest in currentQuests"
                                    :key="quest.id"
                                    class="small text-white-50"
                                >
                                    {{ quest.name.length > 40 ? quest.name.slice(0,40) + "..." : quest.name }}
                                </li>
                            </ul>
                            <p v-if="selectedUser.completedQuests.length" class="small min-spacing">
                                Completed Quests:
                            </p>
                            <ul class="min-spacing mb-2 ml-4">
                                <li
                                    v-for="quest in selectedUser.completedQuests"
                                    :key="quest.id"
                                    class="small text-white-50"
                                >
                                    {{ quest.name.length > 40 ? quest.name.slice(0,40) + "..." : quest.name }}
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="radial-divisor mx-auto my-3" />
                    <span v-if="!beatmaps.length"><p>Loading beatmaps...</p></span>
                    <span v-if="userMaps && userMaps.length">
                        <p>Mappers' Guild maps:</p>
                        <table class="table table-sm table-dark table-hover">
                            <thead>
                                <td scope="col">Mapset</td>
                                <td scope="col">Host</td>
                                <td scope="col">Status</td>
                                <td scope="col">Tasks</td>
                            </thead>
                            <tbody>
                                <tr v-for="map in userMaps" :key="map.id">
                                    <td scope="row">
                                        <template v-if="map.url">
                                            <a :href="map.url" target="_blank">
                                                {{ map.song.artist }} - {{ map.song.title }}
                                            </a>
                                        </template>
                                        <template v-else>
                                            <span class="text-white-50">{{ map.song.artist }} - {{ map.song.title }}</span>
                                        </template>
                                        <i v-if="map.mode == 'taiko'" class="fas fa-drum" />
                                        <i v-else-if="map.mode == 'catch'" class="fas fa-apple-alt" />
                                        <i v-else-if="map.mode == 'mania'" class="fas fa-stream" />
                                    </td>
                                    <td scope="row">
                                        <a
                                            :href="'https://osu.ppy.sh/users/' + map.host.osuId"
                                            target="_blank"
                                        >
                                            {{ map.host.username }}
                                        </a>
                                    </td>
                                    <td scope="row" :class="map.status.toLowerCase()">
                                        {{ map.status }}
                                    </td>
                                    <td scope="row" class="text-white-50">
                                        {{ userTasks(map) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="radial-divisor mx-auto my-3" />
                    </span>
                    <p class="float-right">
                        Joined: {{ selectedUser.createdAt.slice(0, 10) }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import Axios from 'axios';
import { Quest } from '../../../interfaces/quest';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';
import UserPointsRow from './UserPointsRow.vue';

export default Vue.extend({
    name: 'UserInfo',
    components: {
        UserPointsRow,
    },
    data() {
        return {
            currentQuests: [] as Quest[],
        };
    },
    computed: {
        ...mapState({
            beatmaps: (state: any) => state.beatmaps as Beatmap[],
            userId: (state: any) => state.userId as string,
        }),
        ...mapGetters([
            'selectedUser',
        ]),
        userMaps(): Beatmap[] {
            if (this.beatmaps) {
                return this.beatmaps.filter(b => {
                    return b.tasks.some(t => {
                        return t.mappers.some(m => {
                            return m.id == this.selectedUser.id;
                        });
                    });
                });
            }

            return [];
        },
    },
    watch: {
        async selectedUser(): Promise<void> {
            history.pushState(null, 'Users', `/users?id=${this.selectedUser.id}`);

            this.currentQuests = [];
            const res = await Axios.get(`/users/findCurrentQuests/${this.selectedUser.id}`);

            if (res.data?.currentQuests) {
                this.currentQuests = res.data.currentQuests;
            }
        },
    },
    methods: {
        userTasks(beatmap: Beatmap): string {
            let tasks = '';

            beatmap.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if (mapper.id == this.selectedUser.id) {
                        tasks += task.name + ', ';
                    }
                });
            });

            return tasks.slice(0, -2);
        },
    },
});
</script>
