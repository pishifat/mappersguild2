<template>
    <div>
        <div class="container card card-body py-1">
            <div class="row">
                <div class="col">
                    <button class="btn btn-sm btn-info w-100" data-bs-toggle="modal" data-bs-target="#submitQuest">
                        Add quest
                    </button>

                    <button class="btn btn-sm btn-info w-100" @click="removeDuplicatePartyMembers($event)">
                        Remove duplicate party members
                    </button>

                    <data-table
                        v-slot="{ obj: quest }"
                        :data="quests"
                        :headers="['name', 'creator', 'modes', 'status', 'mapsets']"
                        :custom-data-target="'#editQuest'"
                        @update:selected-id="selectedQuestId = $event"
                    >
                        <td>
                            {{ quest.name }}
                        </td>
                        <td>
                            {{ quest.creator.username }}
                        </td>
                        <td>
                            <i v-if="quest.modes.includes('osu')" class="fas fa-circle" />
                            <i v-if="quest.modes.includes('taiko')" class="fas fa-drum" />
                            <i v-if="quest.modes.includes('catch')" class="fas fa-apple-alt" />
                            <i v-if="quest.modes.includes('mania')" class="fas fa-stream" />
                        </td>
                        <td>
                            {{ quest.status }}
                        </td>
                        <td>
                            {{ quest.requiredMapsets }}
                        </td>
                    </data-table>
                </div>
            </div>
        </div>

        <submit-quest-modal
            :is-admin="true"
        />

        <quest-info
            v-if="selectedQuest"
            :quest="selectedQuest"
            @update-quest="updateQuest($event)"
            @delete-quest="deleteQuest($event)"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import SubmitQuestModal from '../../components/quests/SubmitQuestModal.vue';
import QuestInfo from '../../components/admin/quests/QuestInfo.vue';
import DataTable from '../../components/admin/DataTable.vue';
import { Quest } from '../../../interfaces/quest';
import questsAdminModule from '@store/admin/quests';

export default Vue.extend({
    components: {
        DataTable,
        SubmitQuestModal,
        QuestInfo,
    },
    data () {
        return {
            selectedQuestId: '',
        };
    },
    computed: {
        ...mapState({
            quests: (state: any) => state.questsAdmin.quests,
        }),
        selectedQuest(): undefined | Quest {
            return this.quests.find(q => q.id === this.selectedQuestId);
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('questsAdmin')) {
            this.$store.registerModule('questsAdmin', questsAdminModule);
        }
    },
    destroyed() {
        if (this.$store.hasModule('questsAdmin')) {
            this.$store.unregisterModule('questsAdmin');
        }
    },
    async created() {
        const quests = await this.initialRequest<Quest[]>('/admin/quests/load');

        if (!this.isError(quests)) {
            this.$store.commit('setQuests', quests);
        }
    },
    methods: {
        deleteQuest(q): void {
            const i = this.quests.findIndex(quest => quest.id == q.id);
            this.quests.splice(i, 1);
        },
        updateQuest(q): void {
            const i = this.quests.findIndex(quest => quest.id == q.id);

            if (i !== -1) {
                Vue.set(this.quests, i, q);
            }
        },
        async removeDuplicatePartyMembers(e): Promise<void> {
            const success = await this.executePost('/admin/quests/removeDuplicatePartyMembers', {}, e);

            if (success) {
                this.$store.dispatch('updateToastMessages', {
                    message: `removed duplicate party members`,
                    type: 'success',
                });
            }
        },
    },
});
</script>
