<template>
    <div v-cloak>
        <add-contest />

        <markdown-new-contest-template />

        <contest-info
            v-for="contest in contests"
            :key="contest.id"
            :contest="contest"
        />

        <ToastMessages />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import ContestInfo from '@components/admin/contests/ContestInfo.vue';
import AddContest from '@components/admin/contests/AddContest.vue';
import MarkdownNewContestTemplate from '@components/admin/contests/MarkdownNewContestTemplate.vue';
import ToastMessages from '@components/ToastMessages.vue';
import { mapState } from 'vuex';
import { Contest } from '../../../interfaces/contest/contest';

export default Vue.extend({
    name: 'ContestPage',
    components: {
        ToastMessages,
        ContestInfo,
        AddContest,
        MarkdownNewContestTemplate,
    },
    computed: {
        ...mapState([
            'contests',
        ]),
    },
    async created() {
        const contests = await this.executeGet<Contest[]>('/admin/contests/relevantInfo');

        if (!this.isError(contests)) {
            this.$store.commit('setContests', contests);
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
    },
});
</script>