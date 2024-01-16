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

            let count = hostUsernames.reduce(function (a: any, b: any) {
                return (
                    a[b] ? ++a[b] :(a[b] = 1),
                    a
                );
            }, {});

            const users: any[] = [];
            const userOsuIds: number[] = [];

            for (const host of hosts) {
                if (!userOsuIds.includes(host.osuId)) {
                    userOsuIds.push(host.osuId);
                    users.push({
                        username: host.username,
                        osuId: host.osuId,
                        total: count[host.username],
                        isQuestTrailblazer: host.isQuestTrailblazer,
                    });
                }
            }

            const sortedUsers = users.sort((a, b) => b.total - a.total);

            return sortedUsers;
        },
        async toggleIsQuestTrailblazer(userOsuId, e): Promise<void> {
            const winCondition = await this.$http.executePost(`/admin/missions/toggleIsQuestTrailblazer/`, { userOsuId }, e);

            if (!this.$http.isError(winCondition)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `toggled isQuestTrailblazer, refresh to see changes`,
                    type: 'info',
                });
            }
        },
    },
});
</script>
