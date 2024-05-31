<template>
    <div>
        <div class="container card card-body py-1">
            <div class="row">
                <div class="col">
                    <button class="btn btn-sm btn-info w-100 mb-1" data-bs-toggle="modal" data-bs-target="#submitQuest">
                        Add quest
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
                            <modes-icons :modes="quest.modes" />
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
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import SubmitQuestModal from '../../components/quests/SubmitQuestModal.vue';
import QuestInfo from '../../components/admin/quests/QuestInfo.vue';
import DataTable from '../../components/admin/DataTable.vue';
import { Quest } from '../../../interfaces/quest';
import questsAdminModule from '@store/admin/quests';
import ModesIcons from '@components/ModesIcons.vue';

export default defineComponent({
    components: {
        DataTable,
        SubmitQuestModal,
        QuestInfo,
        ModesIcons,
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
    unmounted () {
        if (this.$store.hasModule('questsAdmin')) {
            this.$store.unregisterModule('questsAdmin');
        }
    },
    async created() {
        const quests = await this.$http.initialRequest<Quest[]>('/admin/quests/load');

        if (!this.$http.isError(quests)) {
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
                this.quests[i] = q;
            }
        },
    },
});
</script>
