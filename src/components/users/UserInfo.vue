<template>
    <modal-dialog
        id="extendedInfo"
        :loaded="Boolean(selectedUser)"
        :header-class="selectedUser ? ('bg-rank-' + selectedUser.rank) : ''"
    >
        <template #header>
            <user-link class="text-dark" :user="selectedUser" />
        </template>

        <template #default>
            <div class="row">
                <div class="col-md-6">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th scope="col">
                                    Task
                                </th>
                                <th scope="col">
                                    Points
                                </th>
                            </tr>
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
                                v-if="selectedUser.contestScreenerPoints"
                                :points="selectedUser.contestScreenerPoints"
                                :display="'MBC screening'"
                                :tooltip-title="'screening entries for Monthly Beatmapping Contests'"
                            />
                            <user-points-row
                                v-if="selectedUser.contestJudgePoints"
                                :points="selectedUser.contestJudgePoints"
                                :display="'MBC judging'"
                                :tooltip-title="'judging entries for Monthly Beatmapping Contests'"
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
                </div>

                <div class="col-md-6">
                    <p
                        class="small"
                    >
                        Rank:
                        <i
                            v-if="selectedUser.rank > 0"
                            v-bs-tooltip="`rank ${selectedUser.rank} user`"
                            class="fas fa-crown"
                            :class="'text-rank-' + selectedUser.rank"
                        />
                        <span v-else class="text-white-50">
                            None
                        </span>
                    </p>

                    <div v-if="currentQuests.length" class="small">
                        Current quests:
                    </div>
                    <ul class="p-0 mb-2 ms-4">
                        <li
                            v-for="quest in currentQuests"
                            :key="quest.id"
                            class="small text-white-50"
                        >
                            <a :href="'/quests?id=' + quest.id" target="_blank">
                                {{ quest.name.length > 40 ? quest.name.slice(0,40) + "..." : quest.name }}
                            </a>
                        </li>
                    </ul>

                    <div v-if="currentQuests.length" class="small">
                        Created quests:
                    </div>
                    <ul class="p-0 mb-2 ms-4">
                        <li
                            v-for="name in createdQuestNames"
                            :key="name"
                            class="small text-white-50"
                        >
                            {{ name.length > 40 ? name.slice(0,40) + "..." : name }}
                        </li>
                    </ul>

                    <div v-if="selectedUser.completedQuests.length" class="small">
                        Completed quests:
                    </div>
                    <ul class="p-0 mb-2 ms-4">
                        <li
                            v-for="quest in selectedUser.completedQuests"
                            :key="quest.id"
                            class="small text-white-50"
                        >
                            <a :href="'/quests?id=' + quest.id" target="_blank">
                                {{ quest.name.length > 40 ? quest.name.slice(0,40) + "..." : quest.name }}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="radial-divisor" />

            <div class="row">
                <div class="col-sm">
                    <p>Mappers' Guild beatmaps:</p>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th scope="col">
                                    Mapset
                                </th>
                                <th scope="col">
                                    Host
                                </th>
                                <th scope="col">
                                    Tasks
                                </th>
                                <th scope="col" />
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="!userBeatmaps.length">
                                <td scope="row">
                                    ...
                                </td>
                                <td scope="row">
                                    ...
                                </td>
                                <td scope="row">
                                    ...
                                </td>
                                <td scope="row" />
                            </tr>
                            <tr v-for="map in userBeatmaps" :key="map.id">
                                <td scope="row">
                                    <i
                                        v-bs-tooltip="map.status"
                                        class="fas me-1"
                                        :class="['text-' + map.status.toLowerCase(), findIcon(map.status)]"
                                    />
                                    <a :href="'/beatmaps?id=' + map.id" target="_blank" class="me-1">
                                        {{ map.song.artist }} - {{ map.song.title }}
                                    </a>
                                    <modes-icons v-if="map.mode !== 'osu'" :modes="[map.mode]" />
                                </td>
                                <td scope="row">
                                    <user-link :user="map.host" />
                                </td>
                                <td scope="row" class="text-white-50">
                                    {{ userTasks(map) }}
                                </td>
                                <td scope="row" class="text-white-50">
                                    <a v-if="map.url" :href="map.url" target="_blank">
                                        <i class="fas fa-link" />
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="radial-divisor" />

            <div class="row">
                <div class="col-sm">
                    <p>Spent points logs:</p>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th scope="col">
                                    Action
                                </th>
                                <th scope="col">
                                    Spent points
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="!spentPoints.length">
                                <td scope="row">
                                    ...
                                </td>
                                <td scope="row">
                                    ...
                                </td>
                            </tr>
                            <tr v-for="spentPointsEvent in spentPoints" :key="spentPointsEvent.id">
                                <td scope="row" class="text-white-50">
                                    {{ findSpentPointsAction (spentPointsEvent.category) }}
                                    <a :href="'/quests/?id=' + spentPointsEvent.quest.id" target="_blank">
                                        {{ spentPointsEvent.quest.name }}
                                    </a>
                                </td>
                                <td scope="row" class="text-white-50">
                                    {{ findSpentPointsValue(spentPointsEvent.category, spentPointsEvent.quest) }} <i class="fas fa-coins" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="radial-divisor" />

            <p class="float-end">
                Joined: {{ selectedUser.createdAt.slice(0, 10) }}
            </p>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import ModalDialog from '@components/ModalDialog.vue';
import { Quest } from '../../../interfaces/quest';
import { SpentPoints } from '../../../interfaces/spentPoints';
import { Beatmap } from '../../../interfaces/beatmap/beatmap';
import UserPointsRow from './UserPointsRow.vue';
import { TaskName } from '../../../interfaces/beatmap/task';
import { BeatmapStatus } from '../../../interfaces/beatmap/beatmap';
import ModesIcons from '@components/ModesIcons.vue';

export default defineComponent({
    name: 'UserInfo',
    components: {
        UserPointsRow,
        ModalDialog,
        ModesIcons,
    },
    data () {
        return {
            currentQuests: [] as Quest[],
            createdQuestNames: [] as Quest['name'][],
            spentPoints: [] as SpentPoints[],
            userBeatmaps: [] as Beatmap[],
            sortOrder: Object.values(TaskName),
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapGetters('users', [
            'selectedUser',
        ]),
    },
    watch: {
        async selectedUser(): Promise<void> {
            if (!this.selectedUser || this.selectedUser.id === this.$route.query.id) return;

            this.$router.push(`/users?id=${this.selectedUser.id}`);

            this.currentQuests = [];
            this.createdQuestNames = [];
            this.spentPoints = [];
            this.userBeatmaps = [];

            const [currentQuests, createdQuestNames, points, beatmaps] = await Promise.all([
                this.$http.executeGet<Quest[]>(`/users/${this.selectedUser.id}/quests`),
                this.$http.executeGet<Quest['name'][]>(`/users/findCreatedQuests/${this.selectedUser.id}`),
                this.$http.executeGet<SpentPoints[]>(`/users/findSpentPoints/${this.selectedUser.id}`),
                this.$http.executeGet<Beatmap[]>(`/users/findUserBeatmaps/${this.selectedUser.id}`),
            ]);

            if (!this.$http.isError(currentQuests)) {
                this.currentQuests = currentQuests;
            }

            if (!this.$http.isError(createdQuestNames)) {
                this.createdQuestNames = createdQuestNames;
            }

            if (!this.$http.isError(points)) {
                this.spentPoints = points;
            }

            if (!this.$http.isError(beatmaps)) {
                const statusSort = ['WIP', 'Done', 'Qualified', 'Ranked'];

                this.userBeatmaps = beatmaps.sort(function(a, b) {
                    return statusSort.indexOf(a.status) - statusSort.indexOf(b.status);
                });
            }
        },
    },
    methods: {
        findIcon(status): string {
            if (status == BeatmapStatus.WIP) {
                return 'fa-ellipsis-h';
            } else if (status == BeatmapStatus.Done) {
                return 'fa-check';
            } else if (status == BeatmapStatus.Qualified) {
                return 'fa-check-circle';
            } else if (status == BeatmapStatus.Ranked) {
                return 'fa-check-circle';
            }

            return '';
        },
        userTasks(beatmap: Beatmap): string {
            const tasks = [...beatmap.tasks];

            tasks.sort((a, b) => {
                return this.sortOrder.indexOf(a.name) - this.sortOrder.indexOf(b.name);
            });

            let tasksText = '';

            beatmap.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if (mapper.id == this.selectedUser.id) {
                        tasksText += task.name + ', ';
                    }
                });
            });

            return tasksText.slice(0, -2);
        },
        calculatePoints(quest): number {
            let points = 25;

            if (!quest.art) {
                points += 10;
            }

            if (quest.requiredMapsets < 1) {
                points = 727;
            } else if (quest.requiredMapsets == 1) {
                points += 100;
            } else if (quest.requiredMapsets < 10) {
                points += (10-quest.requiredMapsets)*7.5;
            }

            return points;
        },
        findSpentPointsAction(category): string {
            switch (category) {
                case 'acceptQuest':
                    return 'Accepted quest:';
                case 'reopenQuest':
                    return 'Reopened quest:';
                case 'extendDeadline':
                    return 'Extended quest deadline:';
                case 'createQuest':
                    return 'Created quest:';
                default:
                    return 'undefined action';
            }
        },
        findSpentPointsValue(category, quest): number {
            switch (category) {
                case 'acceptQuest':
                    return quest.price;
                case 'reopenQuest':
                    return quest.reopenPrice;
                case 'extendDeadline':
                    return 10;
                case 'createQuest':
                    return this.calculatePoints(quest);
                default:
                    return 0;
            }
        },
    },
});
</script>
