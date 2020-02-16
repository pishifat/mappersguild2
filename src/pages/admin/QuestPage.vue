<template>
    <div>
        <div class="container bg-container py-1">
            <div class="row">
                <div class="col">
                    <h5 class="ml-4 mt-2">
                        Quests

                        <button class="btn btn-sm btn-outline-info" data-toggle="modal" data-target="#addQuest">
                            Add quest
                        </button>
                    </h5>

                    <data-table
                        #default="{ obj }"
                        :data="quests"
                        :headers="['name', 'modes', 'status']"
                        modal-name="editQuest"
                        @update:selected-id="selectedQuestId = $event"
                    >
                        <td>
                            {{ obj.name }}
                        </td>
                        <td>
                            <i v-if="obj.modes.includes('osu')" class="fas fa-circle" />
                            <i v-if="obj.modes.includes('taiko')" class="fas fa-drum" />
                            <i v-if="obj.modes.includes('catch')" class="fas fa-apple-alt" />
                            <i v-if="obj.modes.includes('mania')" class="fas fa-stream" />
                        </td>
                        <td>
                            {{ obj.status }}
                        </td>
                    </data-table>
                </div>
            </div>
        </div>

        <add-quest
            @add-quest="addQuest($event)"
        />

        <quest-info
            :quest="selectedQuest"
            @update-quest="updateQuest($event)"
            @delete-quest="deleteQuest($event)"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AddQuest from '../../components/admin/quests/AddQuest.vue';
import QuestInfo from '../../components/admin/quests/QuestInfo.vue';
import DataTable from '../../components/admin/DataTable.vue';
import { Quest } from '../../../interfaces/quest';

export default Vue.extend({
    components: {
        DataTable,
        AddQuest,
        QuestInfo,
    },
    data () {
        return {
            quests: [] as Quest[],
            selectedQuestId: '',
        };
    },
    computed: {
        selectedQuest(): undefined | Quest {
            return this.quests.find(q => q.id === this.selectedQuestId);
        },
    },
    async created() {
        const quests = await this.executeGet<Quest[]>('/admin/quests/load');

        if (!this.isError(quests)) {
            this.quests = quests;
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
    },
    methods: {
        addQuest(q): void {
            this.quests.unshift(q);
        },
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
    },
});
</script>