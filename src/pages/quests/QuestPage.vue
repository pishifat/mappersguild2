<template>
    <div>
        <quest-page-filters />

        <status-quests
            status="Open"
            :quests="openQuests"
            :is-first-load-done="isFirstLoadDone"
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
import Vue from 'vue';
import { mapGetters } from 'vuex';
import QuestPageFilters from '@pages/quests/QuestPageFilters.vue';
import StatusQuests from '@pages/quests/StatusQuests.vue';
import SubmitQuestModal from '@components/quests/SubmitQuestModal.vue';
import QuestInfoModal from '@components/quests/QuestInfoModal.vue';
import questsModule from '@store/quests';

export default Vue.extend({
    name: 'QuestPage',
    components: {
        QuestPageFilters,
        StatusQuests,
        SubmitQuestModal,
        QuestInfoModal,
    },
    data () {
        return {
            isFirstLoadDone: false,
        };
    },
    computed: {
        ...mapGetters([
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
    destroyed() {
        if (this.$store.hasModule('quests')) {
            this.$store.unregisterModule('quests');
        }
    },
    async created () {
        const params: any = new URLSearchParams(document.location.search.substring(1));

        if (params.get('id') && params.get('id').length) {
            const [res, urlQuest] = await Promise.all<any, any>([
                this.initialRequest('/quests/relevantInfo'),
                this.executeGet('/quests/searchOnLoad/' + params.get('id')),
            ]);

            if (res) {
                this.$store.commit('setQuests', res.openQuests);
                this.$store.commit('setFilterMode', res.mainMode);
            }

            if (urlQuest && !urlQuest.error) {
                this.$store.commit('setSelectedQuest', urlQuest.id);
                $('#editQuest').modal('show');
            }
        } else {
            const res: any = await this.initialRequest('/quests/relevantInfo');

            if (res) {
                this.$store.commit('setQuests', res.openQuests);
                this.$store.commit('setFilterMode', res.mainMode);
            }
        }

        await this.$store.dispatch('loadQuests');
        this.isFirstLoadDone = true;
    },
});
</script>
