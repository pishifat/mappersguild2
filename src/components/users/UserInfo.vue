<template>
    <modal-dialog
        id="extendedInfo"
        :loaded="Boolean(selectedUser)"
        :header-style="{
            background: `linear-gradient(0deg, ${userRankColor} -250%, rgba(0, 0, 0, 0.65) 130%), url(${userCoverUrl}) center no-repeat`,
            borderBottom: `4px solid ${userRankColor}`,
            backgroundSize: 'cover',
            objectFit: 'fill',
        }"
    >
        <template #header>
            <div class="d-flex flex-row align-items-center gap-3">
                <img :src="'https://a.ppy.sh/' + selectedUser.osuId" class="avatar-img" />
                <user-link class="text-white ml-3" :user="selectedUser" />
            </div>
        </template>

        <template #default>
            <reward-progress
                :badge="'main'"
            />
            <reward-progress
                v-if="selectedUser.completedMissions && selectedUser.completedMissions.length"
                :badge="'mission'"
            />
            <div class="radial-divisor" />
            <div class="row">
                <div class="col-md-6">
                    <table class="table table-sm small">
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
                                v-if="selectedUser.hitsoundPoints"
                                :points="selectedUser.hitsoundPoints"
                                :display="'hitsounding'"
                                :tooltip-title="'~2 points per mapset'"
                            />
                            <user-points-row
                                v-if="selectedUser.storyboardPoints"
                                :points="selectedUser.storyboardPoints"
                                :display="'creating storyboards'"
                                :tooltip-title="'10 points per storyboard'"
                            />
                            <user-points-row
                                v-if="selectedUser.questPoints"
                                :points="selectedUser.questPoints"
                                :display="'completing quests'"
                                :tooltip-title="'7 bonus points for completing quests on time'"
                            />
                            <user-points-row
                                v-if="selectedUser.missionPoints"
                                :points="selectedUser.missionPoints"
                                :display="'completing priority quests'"
                                :tooltip-title="'5-24 bonus points for completing priority quests'"
                            />
                            <user-points-row
                                v-if="selectedUser.modPoints"
                                :points="selectedUser.modPoints"
                                :display="'modding mapsets'"
                                :tooltip-title="'~1 point per mod'"
                            />
                            <user-points-row
                                v-if="selectedUser.hostPoints"
                                :points="selectedUser.hostPoints"
                                :display="'hosting mapsets'"
                                :tooltip-title="'3 points per mapset hosted'"
                            />
                            <user-points-row
                                v-if="selectedUser.contestCreatorPoints"
                                :points="selectedUser.contestCreatorPoints"
                                :display="'FA contest creation'"
                                :tooltip-title="`creation of FA beatmapping contests hosted on Mappers' Guild`"
                            />
                            <user-points-row
                                v-if="selectedUser.contestParticipantPoints"
                                :points="selectedUser.contestParticipantPoints"
                                :display="'FA contest participation'"
                                :tooltip-title="`participating in FA beatmapping contests hosted on Mappers' Guild`"
                            />
                            <user-points-row
                                v-if="selectedUser.contestScreenerPoints"
                                :points="selectedUser.contestScreenerPoints"
                                :display="'FA contest screening'"
                                :tooltip-title="`screening entries in FA beatmapping contests hosted on Mappers' Guild`"
                            />
                            <user-points-row
                                v-if="selectedUser.contestJudgePoints"
                                :points="selectedUser.contestJudgePoints"
                                :display="'FA contest judging'"
                                :tooltip-title="`judging entries in FA beatmapping contests hosted on Mappers' Guild`"
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
                            :key="$route.query.id?.toString()"
                            v-bs-tooltip="`rank ${selectedUser.rank} user`"
                            class="fas fa-crown"
                            :class="'text-rank-' + selectedUser.rank"
                        />
                        <span v-else class="text-secondary">
                            None
                        </span>
                    </p>

                    <div v-if="currentMissions.length" class="small">
                        Current missions:
                    </div>
                    <ul class="p-0 mb-2 ms-4">
                        <li
                            v-for="mission in currentMissions"
                            :key="mission.id"
                            class="small text-secondary"
                        >
                            <a :href="'/missions?id=' + mission.id" target="_blank">
                                {{ mission.name.length > 40 ? mission.name.slice(0,40) + "..." : mission.name }}
                            </a>
                        </li>
                    </ul>

                    <div v-if="currentQuests.length" class="small">
                        Current quests:
                    </div>
                    <ul class="p-0 mb-2 ms-4">
                        <li
                            v-for="quest in currentQuests"
                            :key="quest.id"
                            class="small text-secondary"
                        >
                            <a :href="'/quests?id=' + quest.id" target="_blank">
                                {{ quest.name.length > 40 ? quest.name.slice(0,40) + "..." : quest.name }}
                            </a>
                        </li>
                    </ul>
                    <template v-if="selectedUser.completedMissions && selectedUser.completedMissions.length">
                        <div class="small">
                            Completed priority quests:
                        </div>
                        <ul class="p-0 mb-2 ms-4">
                            <li
                                v-for="mission in selectedUser.completedMissions"
                                :key="mission.id"
                                class="small text-secondary"
                            >
                                <a :href="'/missions?id=' + mission.id" target="_blank">
                                    {{ mission.name.length > 40 ? mission.name.slice(0,40) + "..." : mission.name }}
                                </a>
                            </li>
                        </ul>
                    </template>
                    <template v-if="selectedUser.completedQuests && selectedUser.completedQuests.length">
                        <div class="small">
                            Completed quests:
                        </div>
                        <ul class="p-0 mb-2 ms-4">
                            <li
                                v-for="quest in selectedUser.completedQuests"
                                :key="quest.id"
                                class="small text-secondary"
                            >
                                <a :href="'/quests?id=' + quest.id" target="_blank">
                                    {{ quest.name.length > 40 ? quest.name.slice(0,40) + "..." : quest.name }}
                                </a>
                            </li>
                        </ul>
                    </template>
                    <div v-if="createdQuestNames.length" class="small">
                        Created quests:
                    </div>
                    <ul class="p-0 mb-2 ms-4">
                        <li
                            v-for="name in createdQuestNames"
                            :key="name"
                            class="small text-secondary"
                        >
                            {{ name.length > 40 ? name.slice(0,40) + "..." : name }}
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
                                    <modes-icons
                                        v-if="map.mode !== 'osu'"
                                        :modes="[map.mode]"
                                        color="secondary"
                                    />
                                </td>
                                <td scope="row">
                                    <user-link :user="map.host" />
                                </td>
                                <td scope="row" class="text-secondary">
                                    {{ userTasks(map) }}
                                </td>
                                <td scope="row" class="text-secondary">
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
                                <td scope="row" class="text-secondary">
                                    {{ findSpentPointsAction (spentPointsEvent.category) }}
                                    <a v-if="spentPointsEvent.quest" :href="'/quests/?id=' + spentPointsEvent.quest.id" target="_blank">
                                        {{ spentPointsEvent.quest.name }}
                                    </a>
                                    <a v-else-if="spentPointsEvent.mission" :href="'/missions/?id=' + spentPointsEvent.mission.id" target="_blank">
                                        {{ spentPointsEvent.mission.name }}
                                    </a>
                                </td>
                                <td scope="row" class="text-secondary">
                                    {{ findSpentPointsValue(spentPointsEvent.category, spentPointsEvent.quest, spentPointsEvent.mission, spentPointsEvent.id) }} <i class="fas fa-coins" />
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
import { Quest } from '@interfaces/quest';
import { Mission } from '@interfaces/mission';
import { SpentPoints, SpentPointsCategory } from '@interfaces/spentPoints';
import { Beatmap } from '@interfaces/beatmap/beatmap';
import UserPointsRow from './UserPointsRow.vue';
import { TaskName } from '@interfaces/beatmap/task';
import { BeatmapStatus } from '@interfaces/beatmap/beatmap';
import ModesIcons from '@components/ModesIcons.vue';
import RewardProgress from './RewardProgress.vue';

export default defineComponent({
    name: 'UserInfo',
    components: {
        UserPointsRow,
        ModalDialog,
        ModesIcons,
        RewardProgress,
    },
    data () {
        return {
            currentQuests: [] as Quest[],
            currentMissions: [] as Mission[],
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
        userCoverUrl() {
            if (this.selectedUser)
                return this.selectedUser.cover ? this.selectedUser.cover?.url : `https://a.ppy.sh/${this.selectedUser.osuId}`;

            return '';
        },
        userRankColor() {
            return this.selectedUser ? (`var(--rank-${this.selectedUser.rank}-bg)`) : 'var(--rank-0-bg)';
        },
    },
    watch: {
        async selectedUser(): Promise<void> {
            await this.loadEverything();
        },
    },
    async created (): Promise<void> {
        await this.loadEverything();
    },
    methods: {
        async loadEverything(): Promise<void> {
            if (!this.selectedUser) return;

            this.$router.push(`/users?id=${this.selectedUser.id}`);

            this.currentQuests = [];
            this.currentMissions = [];
            this.createdQuestNames = [];
            this.spentPoints = [];
            this.userBeatmaps = [];

            const [currentQuests, currentMissions, createdQuestNames, points, beatmaps] = await Promise.all([
                this.$http.executeGet<Quest[]>(`/users/${this.selectedUser.id}/quests`),
                this.$http.executeGet<Mission[]>(`/users/${this.selectedUser.id}/missions`),
                this.$http.executeGet<Quest['name'][]>(`/users/findCreatedQuests/${this.selectedUser.id}`),
                this.$http.executeGet<SpentPoints[]>(`/users/findSpentPoints/${this.selectedUser.id}`),
                this.$http.executeGet<Beatmap[]>(`/users/findUserBeatmaps/${this.selectedUser.id}`),
            ]);

            if (!this.$http.isError(currentQuests)) {
                this.currentQuests = currentQuests;
            }

            if (!this.$http.isError(currentMissions)) {
                this.currentMissions = currentMissions;
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
                        const taskName = task.mode == 'taiko' ? this.findTaikoName(task.name) : task.mode == 'catch' ? this.findCatchName(task.name) : task.name;
                        tasksText += taskName + ', ';
                    }
                });
            });

            return tasksText.slice(0, -2);
        },
        findTaikoName(taskName): string {
            switch (taskName.toLowerCase()) {
                case 'easy':
                    return 'Kantan';
                case 'normal':
                    return 'Futsuu';
                case 'hard':
                    return 'Muzukashii';
                case 'insane':
                    return 'Oni';
                case 'expert':
                    return 'Inner Oni';
                default:
                    return taskName;
            }
        },
        findCatchName(taskName): string {
            switch (taskName.toLowerCase()) {
                case 'easy':
                    return 'Cup';
                case 'normal':
                    return 'Salad';
                case 'hard':
                    return 'Platter';
                case 'insane':
                    return 'Rain';
                case 'expert':
                    return 'Overdose';
                default:
                    return taskName;
            }
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
                case SpentPointsCategory.AcceptQuest:
                    return 'Accepted quest:';
                case SpentPointsCategory.ReopenQuest:
                    return 'Reopened quest:';
                case SpentPointsCategory.ExtendDeadline:
                    return 'Extended quest deadline:';
                case SpentPointsCategory.CreateQuest:
                    return 'Created quest:';
                case SpentPointsCategory.RerollShowcaseMissionSong:
                    return 'Rerolled priority quest song:';
                case SpentPointsCategory.RerollShowcaseMissionArtist:
                    return 'Rerolled priority quest artist:';
                default:
                    return 'undefined action';
            }
        },
        findSpentPointsValue(category, quest, mission, currentEventId): number {
            switch (category) {
                case SpentPointsCategory.AcceptQuest:
                    return quest.price;
                case SpentPointsCategory.ReopenQuest:
                    return quest.reopenPrice;
                case SpentPointsCategory.ExtendDeadline:
                    return 10;
                case SpentPointsCategory.CreateQuest:
                    return this.calculatePoints(quest);
                case SpentPointsCategory.RerollShowcaseMissionSong:
                    return 35;
                case SpentPointsCategory.RerollShowcaseMissionArtist:
                    return this.calculateArtistRerollCost(mission, currentEventId);
                default:
                    return 0;
            }
        },
        calculateArtistRerollCost(mission, currentEventId): number {
            if (!mission) return 10; // fallback to first reroll cost

            // Get all artist rerolls for this mission
            const allArtistRerolls = this.spentPoints.filter(sp =>
                sp.category === SpentPointsCategory.RerollShowcaseMissionArtist &&
                sp.mission?.id === mission.id
            );

            // Sort by creation date to get chronological order (oldest first)
            const sortedRerolls = allArtistRerolls.sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            // Find the position of the current event in chronological order
            const currentEventIndex = sortedRerolls.findIndex(sp => sp.id === currentEventId);
            
            // Calculate cost: 10 * 2^(chronological position)
            // First reroll (index 0) = 10, second (index 1) = 20, etc.
            return 10 * Math.pow(2, currentEventIndex);
        },
    },
});
</script>

<style scoped>
.avatar-img {
    top: calc(70% - 40px);
    left: -12px;
    width: 70px;
    height: 70px;
    max-width: 120px;
    max-height: 120px;
    object-fit: cover;
    border-radius: 100%;
    box-shadow: 0 1px 1rem rgba(10, 10, 25, .9);
    background-color: var(--gray-dark);
}
</style>
