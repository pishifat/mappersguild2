<template>
    <div v-cloak>
        <div class="container bg-container py-1">
            <div class="row">
                <div class="col">
                    <button class="btn btn-sm btn-info btn-block" data-toggle="modal" data-target="#submitQuest">
                        Add quest
                    </button>

                    <button class="btn btn-sm btn-info btn-block" @click="removeDuplicatePartyMembers($event)">
                        Remove duplicate party members
                    </button>

                    <data-table
                        #default="{ obj: quest }"
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
            :quest="selectedQuest"
            @update-quest="updateQuest($event)"
            @delete-quest="deleteQuest($event)"
        />

        <toast-messages />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import SubmitQuestModal from '../../components/quests/SubmitQuestModal.vue';
import QuestInfo from '../../components/admin/quests/QuestInfo.vue';
import DataTable from '../../components/admin/DataTable.vue';
import ToastMessages from '../../components/ToastMessages.vue';
import { Quest } from '../../../interfaces/quest';
import { mapState } from 'vuex';

export default Vue.extend({
    components: {
        DataTable,
        SubmitQuestModal,
        QuestInfo,
        ToastMessages,
    },
    data () {
        return {
            selectedQuestId: '',
        };
    },
    computed: {
        ...mapState(['quests']),
        selectedQuest(): undefined | Quest {
            return this.quests.find(q => q.id === this.selectedQuestId);
        },
    },
    async created() {
        const quests = await this.executeGet<Quest[]>('/admin/quests/load');

        if (!this.isError(quests)) {
            this.$store.commit('setQuests', quests);
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
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
