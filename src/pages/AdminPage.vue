<template>
    <div v-cloak>
        <div class="container bg-container py-1">
            <div class="row">
                <div class="col">
                    <h3 class="ml-2 mt-2">
                        Action Needed
                    </h3>
                    <h5 class="ml-4 mt-2">
                        <a href="#actionBeatmaps" data-toggle="collapse">
                            Beatmaps
                            <i class="fas fa-angle-down" />
                        </a>
                        <span v-if="actionBeatmapsLoading" class="ml-2 small text-white-50">loading...</span>
                    </h5>
                    <div id="actionBeatmaps" class="show">
                        <table v-if="actionBeatmaps.length" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">
                                    METADATA
                                </th>
                                <th scope="col">
                                    PACK ID
                                </th>
                                <th scope="col">
                                    STATUS
                                </th>
                                <th scope="col">
                                    EDIT
                                </th>
                            </thead>
                            <tbody>
                                <tr v-for="beatmap in actionBeatmaps" :key="beatmap.id" class="text-white-50">
                                    <td scope="row">
                                        <i v-if="beatmap.mode == 'osu'" class="fas fa-circle" />
                                        <i v-else-if="beatmap.mode == 'taiko'" class="fas fa-drum" />
                                        <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt" />
                                        <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream" />
                                        <a v-if="beatmap.url" :href="beatmap.url">
                                            {{ generateMetadata(beatmap.song) }}
                                        </a>
                                        <span v-else>{{ generateMetadata(beatmap.song) }}</span>
                                    </td>
                                    <td scope="row">
                                        {{ beatmap.packId }}
                                    </td>
                                    <td scope="row">
                                        {{ beatmap.status }}
                                    </td>
                                    <td scope="row">
                                        <a
                                            href="#"
                                            data-toggle="modal"
                                            data-target="#editBeatmap"
                                            :data-id="beatmap.id"
                                            @click.prevent="$store.commit('setSelectedBeatmap', beatmap)"
                                        >
                                            edit
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <span v-else-if="!actionBeatmapsLoading" class="text-white-50">None...</span>
                    </div>
                    <h5 class="ml-4 mt-2">
                        <a href="#actionQuests" data-toggle="collapse">
                            Quests
                            <i class="fas fa-angle-down" />
                        </a>
                        <span v-if="actionQuestsLoading" class="ml-2 small text-white-50">loading...</span>
                    </h5>
                    <div id="actionQuests" class="show">
                        <table v-if="actionQuests.length" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">
                                    NAME
                                </th>
                                <th scope="col">
                                    CREATOR
                                </th>
                                <th scope="col">
                                    MODES
                                </th>
                                <th scope="col">
                                    STATUS
                                </th>
                                <th scope="col">
                                    MAPSETS
                                </th>
                                <th scope="col">
                                    EDIT
                                </th>
                            </thead>
                            <tbody>
                                <tr v-for="quest in actionQuests" :key="quest.id" class="text-white-50">
                                    <td scope="row">
                                        {{ quest.name }}
                                    </td>
                                    <td scope="row">
                                        {{ quest.creator.username }}
                                    </td>
                                    <td scope="row">
                                        <i v-if="quest.modes.includes('osu')" class="fas fa-circle" />
                                        <i v-if="quest.modes.includes('taiko')" class="fas fa-drum" />
                                        <i v-if="quest.modes.includes('catch')" class="fas fa-apple-alt" />
                                        <i v-if="quest.modes.includes('mania')" class="fas fa-stream" />
                                    </td>
                                    <td scope="row">
                                        {{ quest.status }}
                                    </td>
                                    <td scope="row">
                                        {{ quest.requiredMapsets }}
                                    </td>
                                    <td scope="row">
                                        <a
                                            href="#"
                                            data-toggle="modal"
                                            :data-target="quest.status == 'pending' ? '#reviewQuest' : '#editQuest'"
                                            :data-id="quest.id"
                                            @click.prevent="$store.commit('setSelectedQuest', quest)"
                                        >
                                            edit
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <span v-else-if="!actionQuestsLoading" class="text-white-50">None...</span>
                    </div>
                    <h5 class="ml-4 mt-2">
                        <a href="#actionUsers" data-toggle="collapse">
                            Users
                            <i class="fas fa-angle-down" />
                        </a>
                        <span v-if="actionUsersLoading" class="ml-2 small text-white-50">loading...</span>
                    </h5>
                    <div v-if="actionUsers" id="actionUsers" class="show">
                        <table v-if="actionUsers.length" class="table table-sm table-dark table-hover">
                            <thead>
                                <th scope="col">
                                    USERNAME
                                </th>
                                <th scope="col">
                                    RANK
                                </th>
                                <th scope="col">
                                    BADGE
                                </th>
                                <th scope="col">
                                    EDIT
                                </th>
                            </thead>
                            <tbody>
                                <tr v-for="user in actionUsers" :key="user.id" class="text-white-50">
                                    <td scope="row">
                                        <a :href="'https://osu.ppy.sh/users/' + user.osuId" target="_blank">{{ user.username }}</a>
                                    </td>
                                    <td scope="row">
                                        <i
                                            v-if="user.rank > 0"
                                            class="fas fa-crown"
                                            :class="user.rank == 1 ? 'text-rank-1' : user.rank == 2 ? 'text-rank-2' : 'text-rank-3'"
                                            data-toggle="tooltip"
                                            data-placement="top"
                                            :title="user.rank == 1 ? 'rank 1 user' : user.rank == 2 ? 'rank 2 user' : 'rank 3 user'"
                                        />
                                    </td>
                                    <td scope="row" :class="{ 'bg-open': user.rank != user.badge }">
                                        <i
                                            v-if="user.badge > 0"
                                            class="fas fa-crown"
                                            :class="user.badge == 1 ? 'text-rank-1' : user.badge == 2 ? 'text-rank-2' : 'text-rank-3'"
                                            data-toggle="tooltip"
                                            data-placement="top"
                                            :title="user.badge == 1 ? 'rank 1 user' : user.badge == 2 ? 'rank 2 user' : 'rank 3 user'"
                                        />
                                    </td>
                                    <td scope="row">
                                        <a
                                            href="#"
                                            data-toggle="modal"
                                            data-target="#editUser"
                                            :data-id="user.id"
                                            @click.prevent="$store.commit('setSelectedUser', user)"
                                        >
                                            edit
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <span v-else-if="!actionUsersLoading" class="text-white-50">None...</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="radial-divisor mx-auto my-4" />

        <beatmap-info
            v-if="selectedBeatmap"
            :beatmap="selectedBeatmap"
            @update-beatmap="updateBeatmap($event)"
        />

        <quest-info
            v-if="selectedQuest"
            :quest="selectedQuest"
            @update-quest="updateQuest($event)"
            @delete-quest="deleteQuest($event)"
        />

        <review-quest
            v-if="selectedQuest"
            :quest="selectedQuest"
        />

        <user-info
            v-if="selectedUser"
            :user="selectedUser"
            @update-user="updateUser($event)"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import BeatmapInfo from '../components/admin/BeatmapInfo.vue';
import QuestInfo from '../components/admin/quests/QuestInfo.vue';
import ReviewQuest from '../components/admin/quests/ReviewQuest.vue';
import UserInfo from '../components/admin/UserInfo.vue';

export default Vue.extend({
    name: 'AdminPage',
    components: {
        BeatmapInfo,
        QuestInfo,
        ReviewQuest,
        UserInfo,
    },
    computed: mapState([
        'actionBeatmaps',
        'actionBeatmapsLoading',
        'actionQuests',
        'actionQuestsLoading',
        'actionUsers',
        'actionUsersLoading',
        'selectedBeatmap',
        'selectedQuest',
        'selectedUser',
    ]),
    async created() {
        const res: any = await this.executeGet('/admin/relevantInfo');

        if (res) {
            this.$store.commit('setActionBeatmaps', res.actionBeatmaps);
            this.$store.commit('setActionBeatmapsLoading', false);
            this.$store.commit('setActionQuests', res.actionQuests);
            this.$store.commit('setActionQuestsLoading', false);
            this.$store.commit('setActionUsers', res.actionUsers);
            this.$store.commit('setActionUsersLoading', false);
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
    },
    methods: {
        generateMetadata(song): string {
            let metadata = song.artist + ' - ';

            if (song.title.length > 40) {
                metadata += song.title.slice(0,40) + '...';
            } else {
                metadata += song.title;
            }

            return metadata;
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
