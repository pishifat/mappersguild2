<template>
    <div>
        <a href="#missionWinners" data-bs-toggle="collapse" @click.prevent>
            <h5>Mission winners <i class="fas fa-angle-down" /></h5>
        </a>
        <div id="missionWinners" class="collapse ms-2">
            <div>Date threshold:</div>
            <input
                v-model="date"
                class="form-control form-control-sm w-25 mb-2"
                type="date"
                autocomplete="off"
                placeholder="how far back to check"
            />
            <div class="row">
                <div class="col-sm-6">
                    <div
                        v-for="user in loadWinners()"
                        :key="user.osuId"
                        class="ms-4"
                    >
                        <user-link
                            :user="user"
                        />
                        -
                        {{ user.total }}
                        <code v-if="user.total >= 3 && !user.isQuestTrailblazer">.add-badge {{ user.osuId }} questtrailblazer.png "Completed 3+ priority quests in the Mappers' Guild" https://osu.ppy.sh/wiki/en/Community/Mappers_Guild#additional-rewards</code>
                        <button
                            v-if="user.total >= 3 && !user.isQuestTrailblazer"
                            class="btn btn-outline-info btn-sm"
                            href="#"
                            @click.prevent="toggleIsQuestTrailblazer(user.osuId, $event)"
                        >
                            click this after giving user badge
                        </button>
                    </div>
                </div>
                <div class="col-sm-6">
                    <copy-paste>
                        <div v-for="user in loadWinners()" :key="user.id">
                            {{ user.username }}
                        </div>
                    </copy-paste>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { MissionStatus } from '@interfaces/mission';
import { TaskName } from '@interfaces/beatmap/task';
import CopyPaste from '@components/CopyPaste.vue';


export default defineComponent({
    name: 'MissionWinners',
    components: {
        CopyPaste,
    },
    data () {
        return {
            date: '2024-01-01',
        };
    },
    computed: {
        ...mapState({
            missions: (state: any) => state.missionsAdmin.missions,
        }),
        filteredMissions () {
            return this.missions.filter(m => {
                if (m.status == MissionStatus.Closed) {
                    const date = new Date(this.date);

                    if (date < new Date(m.createdAt)) {
                        return true;
                    }
                }
            });
        },
    },
    methods: {
        loadWinners () {
            let winningBeatmaps: any[] = [];

            for (const mission of this.filteredMissions) {
                winningBeatmaps = winningBeatmaps.concat(mission.winningBeatmaps);
            }

            const hosts = winningBeatmaps.map(b => b.host);
            const hostUsernames = hosts.map(h => h.username);

            // exception for the "True Cooperation", "Multi-mode enthusiasts", and "Spread coordinators" missions, which give the set's second mapper credit towards badge too
            let collaborationUsers: any[] = [];
            let collaborationUsernames: string[] = [];

            const collabQuestIds = ['65a3376e48f36f2622ef2f44', '665bbcc1ff4c38cea1113337', '66f488cc56f3f894641d4ace'];

            for (const beatmap of winningBeatmaps) {
                if (collabQuestIds.includes(beatmap.mission.toString())) {
                    for (const task of beatmap.tasks) {
                        if (task.name !== TaskName.Hitsounds && task.name !== TaskName.Storyboard) {
                            for (const mapper of task.mappers) {
                                if (!collaborationUsernames.includes(mapper.username) && beatmap.host.id !== mapper.id) {
                                    if (['63035eff1e8b9e4fa900836f', '62e3dedd9a268823d2e436b8', '6401d31e517b1f1d40ca78e2'].includes(mapper.id) && beatmap.mission.toString() == '665bbcc1ff4c38cea1113337') { // skipping rewards for people who tried to circumvent the rules (or the spirit of the rules) for easy mission progress/points. i want to give the host pity points at least. relevant maps: https://osu.ppy.sh/beatmapsets/2202586#taiko/4719311 and https://osu.ppy.sh/beatmapsets/1670325#osu/4767848
                                        collaborationUsers.push(mapper);
                                        collaborationUsernames.push(mapper.username);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            const winningUsers = hosts.concat(collaborationUsers);
            const winningUsernames = hostUsernames.concat(collaborationUsernames);

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
