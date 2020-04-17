<template>
    <div v-cloak>
        <quest-page-filters />

        <status-quests
            status="Open"
            :quests="openQuests"
            :is-first-load-done="isFirstLoadDone"
        />

        <div class="radial-divisor mx-auto my-4" />

        <status-quests
            status="Work-in-progress"
            :quests="wipQuests"
        />

        <div class="radial-divisor mx-auto my-4" />

        <status-quests
            status="Complete"
            :quests="completeQuests"
        />

        <status-quests
            status="Expired"
            :quests="expiredQuests"
        />

        <toast-messages />

        <submit-quest-modal />

        <quest-info-modal />

        <notifications-access
            v-if="userGroup != 'spectator'"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import NotificationsAccess from '@components/NotificationsAccess.vue';
import ToastMessages from '@components/ToastMessages.vue';
import QuestPageFilters from '@pages/quests/QuestPageFilters.vue';
import StatusQuests from '@pages/quests/StatusQuests.vue';
import SubmitQuestModal from '@components/quests/SubmitQuestModal.vue';
import QuestInfoModal from '@components/quests/QuestInfoModal.vue';

export default Vue.extend({
    name: 'QuestPage',
    components: {
        NotificationsAccess,
        QuestPageFilters,
        StatusQuests,
        ToastMessages,
        SubmitQuestModal,
        QuestInfoModal,
    },
    data () {
        return {
            isFirstLoadDone: false,
        };
    },
    computed: {
        ...mapState([
            'userGroup',
            'openQuests',
        ]),
        ...mapGetters([
            'openQuests',
            'wipQuests',
            'completeQuests',
            'expiredQuests',
        ]),
    },
    async created () {
        const params: any = new URLSearchParams(document.location.search.substring(1));

        if (params.get('id') && params.get('id').length) {
            const [res, urlQuest] = await Promise.all<any, any>([
                this.executeGet('/quests/relevantInfo'),
                this.executeGet('/quests/searchOnLoad/' + params.get('id')),
            ]);

            if (res) {
                this.$store.commit('setQuests', res.openQuests);
                this.$store.commit('setUserId', res.userMongoId);
                this.$store.commit('setUserGroup', res.group);
                this.$store.commit('setUserRank', res.rank);
                this.$store.commit('setFilterMode', res.mainMode);
                this.$store.commit('setAvailablePoints', res.availablePoints);
            }

            if (urlQuest && !urlQuest.error) {
                this.$store.commit('setSelectedQuest', urlQuest);
                $('#editQuest').modal('show');
            }
        } else {
            const res: any = await this.executeGet('/quests/relevantInfo');

            if (res) {
                this.$store.commit('setQuests', res.openQuests);
                this.$store.commit('setUserId', res.userMongoId);
                this.$store.commit('setUserGroup', res.group);
                this.$store.commit('setUserRank', res.rank);
                this.$store.commit('setFilterMode', res.mainMode);
                this.$store.commit('setAvailablePoints', res.availablePoints);
            }
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();

        await this.$store.dispatch('loadQuests');
        this.isFirstLoadDone = true;
    },
});
</script>

<style>
.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}
</style>
