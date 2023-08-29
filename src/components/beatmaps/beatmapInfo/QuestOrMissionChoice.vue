<template>
    <div>
        <div class="row mb-2">
            <div class="col">
                <div>
                    Quest
                    <a
                        id="editLink"
                        v-bs-tooltip:right="'connect mapset with a quest'"
                        href="#"
                        :class="showInput ? 'text-danger' : ''"
                        class="text-success small ms-1"
                        @click.prevent="showInput = !showInput"
                    >
                        <i class="fas fa-edit" />
                    </a>
                </div>
                <div class="small ms-3 text-secondary">
                    <a v-if="beatmap.quest" :href="`/quests?id=${beatmap.quest.id}`">{{ beatmap.quest.name }}</a>
                    <a v-else-if="beatmap.mission" :href="`/missions?id=${beatmap.mission.id}`">{{ beatmap.mission.name }}</a>
                    <i v-else>none</i>
                </div>
            </div>
        </div>

        <div
            v-if="showInput"
            class="row mb-2"
        >
            <div class="col">
                <div class="input-group input-group-sm">
                    <select
                        v-model="dropdownId"
                        class="form-select"
                    >
                        <option value="">
                            No quest
                        </option>
                        <option
                            v-if="userQuests.length"
                            disabled
                        >
                            --- claimed quests ---
                        </option>
                        <option
                            v-for="quest in userQuests"
                            :key="quest.id"
                            :value="quest.id"
                        >
                            {{ quest.name }}
                        </option>
                        <option
                            v-if="openMissions.length"
                            disabled
                        >
                            --- open priority quests ---
                        </option>
                        <option
                            v-for="mission in openMissions"
                            :key="mission.id"
                            :value="mission.id"
                        >
                            {{ mission.name }}
                        </option>
                    </select>
                    <button
                        v-bs-tooltip="'link beatmap to quest'"
                        class="btn btn-outline-info"
                        @click="linkQuestOrMission($event)"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Beatmap } from '@interfaces/beatmap/beatmap';
import { Quest } from '@interfaces/quest';
import { Mission } from '@interfaces/mission';
import { mapState } from 'vuex';

export default defineComponent({
    name: 'QuestOrMissionChoice',
    props: {
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    data () {
        return {
            userQuests: [] as Quest[],
            openMissions: [] as Mission[],
            showInput: false,
            dropdownId: '',
        };
    },
    computed: mapState([
        'loggedInUser',
    ]),
    watch: {
        async beatmap (): Promise<void> {
            this.showInput = false;
            this.dropdownId = this.beatmap.quest?.id || this.beatmap.mission?.id || '';
            const missions = await this.$http.executeGet<Mission[]>(`/missions/open/${this.beatmap.mode}`);

            if (!this.$http.isError(missions)) {
                this.openMissions = missions;
            }
        },
    },
    async created() {
        const quests = await this.$http.executeGet<Quest[]>(`/users/${this.loggedInUser.id}/quests`);
        const missions = await this.$http.executeGet<Mission[]>(`/missions/open/${this.beatmap.mode}`);

        if (!this.$http.isError(quests)) {
            this.userQuests = quests;
        }

        if (!this.$http.isError(missions)) {
            this.openMissions = missions;
        }
    },
    methods: {
        async linkQuestOrMission(e): Promise<void> {
            const isQuest = this.userQuests.find(q => q.id == this.dropdownId);
            const bm = await this.$http.executePost<Beatmap>(
                `/beatmaps/${this.beatmap.id}/${isQuest ? 'linkQuest' : 'linkMission'}`,
                {
                    questOrMissionId: this.dropdownId,
                },
                e
            );

            if (!this.$http.isError(bm)) {
                this.$store.dispatch('beatmaps/updateBeatmap', bm);
            }
        },
    },
});
</script>
