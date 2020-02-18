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

        <toast-messages />

        <notifications-access v-if="userGroup != 'spectator'" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import NotificationsAccess from '@components/NotificationsAccess.vue';
import ToastMessages from '@components/ToastMessages.vue';
import QuestPageFilters from '@pages/quests/QuestPageFilters.vue';
import StatusQuests from '@pages/quests/StatusQuests.vue';

export default Vue.extend({
    name: 'QuestPage',
    components: {
        NotificationsAccess,
        QuestPageFilters,
        StatusQuests,
        ToastMessages,
    },
    data () {
        return {
            isFirstLoadDone: false,
        };
    },
    computed: {
        ...mapState([
            'userGroup',
        ]),
        ...mapGetters([
            'openQuests',
            'wipQuests',
            'completeQuests',
        ]),
    },
    async created () {
        const res: any = await this.executeGet('/quests/relevantInfo');

        if (res) {
            this.$store.commit('setQuests', res.openQuests);
            this.$store.commit('setUserId', res.userMongoId);
            this.$store.commit('setUserGroup', res.group);
            this.$store.commit('setFilterMode', res.mainMode);
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
