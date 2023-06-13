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
                        :class="showQuestInput ? 'text-danger' : ''"
                        class="text-success small ms-1"
                        @click.prevent="showQuestInput = !showQuestInput"
                    >
                        <i class="fas fa-edit" />
                    </a>
                </div>
                <div class="small ms-3 text-white-50">
                    <span v-if="beatmap.quest">{{ beatmap.quest.name }}</span>
                    <i v-else>none</i>
                </div>
            </div>
        </div>

        <div
            v-if="showQuestInput"
            class="row mb-2"
        >
            <div class="col">
                <div class="input-group input-group-sm">
                    <select
                        v-model="dropdownQuestId"
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
                        @click="linkQuest($event)"
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
    name: 'QuestChoice',
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
            showQuestInput: false,
            dropdownQuestId: '',
        };
    },
    computed: mapState([
        'loggedInUser',
    ]),
    watch: {
        beatmap (): void {
            this.showQuestInput = false;
            this.dropdownQuestId = this.beatmap.quest?.id || '';
        },
    },
    async created() {
        const quests = await this.$http.executeGet<Quest[]>(`/users/${this.loggedInUser.id}/quests`);
        const missions = await this.$http.executeGet<Mission[]>(`/missions/open`);

        if (!this.$http.isError(quests)) {
            this.userQuests = quests;
        }

        if (!this.$http.isError(missions)) {
            this.openMissions = missions;
        }
    },
    methods: {
        async linkQuest(e): Promise<void> {
            const bm = await this.$http.executePost<Beatmap>(
                `/beatmaps/${this.beatmap.id}/linkQuest`,
                { questId: this.dropdownQuestId },
                e
            );

            if (!this.$http.isError(bm)) {
                this.$store.dispatch('beatmaps/updateBeatmap', bm);
            }
        },
    },
});
</script>
