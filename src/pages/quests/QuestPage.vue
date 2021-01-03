<template>
    <div>
        <quest-page-filters />

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

        <status-quests
            status="Expired"
            :quests="expiredQuests"
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
import questsModule from '@store/modules/quests/index';

export default defineComponent({
    name: 'QuestPage',
    components: {
        QuestPageFilters,
        StatusQuests,
        SubmitQuestModal,
        QuestInfoModal,
    },
    computed: {
        ...mapState('quests', [
            'isFirstLoadDone',
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

        await this.$store.dispatch('quests/searchQuests');
        this.$store.commit('quests/setFirstLoadDone');
    },
});
</script>
