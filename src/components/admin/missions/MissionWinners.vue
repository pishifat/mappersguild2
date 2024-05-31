<template>
    <div class="container card card-body py-1 my-2">
        <div v-for="user in loadWinners()" :key="user.osuId">
            <user-link
                :user="user"
            />
            -
            {{ user.total }}
            <code v-if="user.total >= 3 && !user.isQuestTrailblazer">.add-badge {{ user.osuId }} questtrailblazer.png "Completed 3+ priority quests in the Mappers' Guild" https://osu.ppy.sh/wiki/en/Community/Mappers_Guild#additional-rewards</code>
            <button
                v-if="user.total >= 3 && !user.isQuestTrailblazer"
                class="btn btn-outline-info btn-sm ms-2"
                href="#"
                @click.prevent="toggleIsQuestTrailblazer(user.osuId, $event)"
            >
                click this after giving user badge
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { MissionStatus } from '@interfaces/mission';
import { TaskName } from '@interfaces/beatmap/task';


export default defineComponent({
    name: 'MissionWinners',
    computed: {
        ...mapState({
            missions: (state: any) => state.missionsAdmin.missions,
        }),
        closedMissions () {
            return this.missions.filter(m => m.status == MissionStatus.Closed);
        },
    },
    methods: {
        loadWinners () {
            let winningBeatmaps: any[] = [];

            for (const mission of this.closedMissions) {
                winningBeatmaps = winningBeatmaps.concat(mission.winningBeatmaps);
            }

            const hosts = winningBeatmaps.map(b => b.host);
            const hostUsernames = hosts.map(h => h.username);

            // exception for the "True Cooperation" mission, which gives the set's second mapper credit towards badge too
            let trueCooperationUsers: any[] = [];
            let trueCooperationUsernames: string[] = [];

            for (const beatmap of winningBeatmaps) {
                if (beatmap.mission.toString() == '65a3376e48f36f2622ef2f44') {
                    for (const task of beatmap.tasks) {
                        if (task.name !== TaskName.Hitsounds && task.name !== TaskName.Storyboard) {
                            for (const mapper of task.mappers) {
                                if (!trueCooperationUsernames.includes(mapper.username) && beatmap.host.id !== mapper.id) {
                                    trueCooperationUsers.push(mapper);
                                    trueCooperationUsernames.push(mapper.username);
                                }
                            }
                        }
                    }
                }
            }

            const winningUsers = hosts.concat(trueCooperationUsers);
            const winningUsernames = hostUsernames.concat(trueCooperationUsernames);

            let count = winningUsernames.reduce(function (a: any, b: any) {
                return (
                    a[b] ? ++a[b] :(a[b] = 1),
                    a
                );
            }, {});

            const users: any[] = [];
            const userOsuIds: number[] = [];

            for (const user of winningUsers) {
                if (!userOsuIds.includes(user.osuId)) {
                    userOsuIds.push(user.osuId);
                    users.push({
                        username: user.username,
                        osuId: user.osuId,
                        total: count[user.username],
                        isQuestTrailblazer: user.isQuestTrailblazer,
                    });
                }
            }

            const sortedUsers = users.sort((a, b) => b.total - a.total);

            return sortedUsers;
        },
        async toggleIsQuestTrailblazer(userOsuId, e): Promise<void> {
            const isQuestTrailblazer = await this.$http.executePost(`/admin/missions/toggleIsQuestTrailblazer/`, { userOsuId }, e);

            if (!this.$http.isError(isQuestTrailblazer)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled isQuestTrailblazer, refresh to see changes`,
                    type: 'info',
                });
            }
        },
    },
});
</script>
