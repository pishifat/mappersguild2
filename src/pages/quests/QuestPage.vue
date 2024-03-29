<template>
    <div>
        <quest-page-filters />

        <quest-information />

        <status-quests
            status="Open"
            :quests="openQuests"
        />

        <div class="radial-divisor" />

        <status-quests
            status="Work-in-progress"
            :quests="wipQuests"
        />

        <div class="radial-divisor" />

        <status-quests
            status="Complete"
            :quests="completeQuests"
        />

        <submit-quest-modal />

        <quest-info-modal />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters, mapState } from 'vuex';
import QuestPageFilters from '@pages/quests/QuestPageFilters.vue';
import StatusQuests from '@pages/quests/StatusQuests.vue';
import SubmitQuestModal from '@components/quests/SubmitQuestModal.vue';
import QuestInfoModal from '@components/quests/QuestInfoModal.vue';
import QuestInformation from '@components/quests/QuestInformation.vue';
import questsModule from '@store/modules/quests/index';
import { Quest } from '@interfaces/quest';

export default defineComponent({
    name: 'QuestPage',
    components: {
        QuestPageFilters,
        StatusQuests,
        SubmitQuestModal,
        QuestInfoModal,
        QuestInformation,
    },
    computed: {
        ...mapState('quests', [
            'isFirstLoadDone',
            'isLoadingQuests',
            'exampleQuest',
        ]),
        ...mapGetters('quests', [
            'openQuests',
            'wipQuests',
            'completeQuests',
            'expiredQuests',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('quests')) {
            this.$store.registerModule('quests', questsModule);
        }
    },
    async created () {
        const id = this.$route.query.id;
        await this.$store.dispatch('quests/loadQuests', id);

        if (id) {
            this.$bs.showModal('editQuest');
        }

        this.$store.commit('quests/setFirstLoadDone');

        const quest = await this.$http.executeGet<Quest>('/exampleQuest');

        if (!this.$http.isError(quest)) {
            this.$store.commit('quests/setExampleQuest', quest);
        }
    },
});
</script>
