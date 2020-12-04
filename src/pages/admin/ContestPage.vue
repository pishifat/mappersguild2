<template>
    <div>
        <add-contest />

        <markdown-new-contest-template />

        <contest-info
            v-for="contest in contests"
            :key="contest.id"
            :contest="contest"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import ContestInfo from '@components/admin/contests/ContestInfo.vue';
import AddContest from '@components/admin/contests/AddContest.vue';
import MarkdownNewContestTemplate from '@components/admin/contests/MarkdownNewContestTemplate.vue';
import { Contest } from '@interfaces/contest/contest';
import contestsModule from '@store/admin/contests';

export default Vue.extend({
    name: 'ContestPage',
    components: {
        ContestInfo,
        AddContest,
        MarkdownNewContestTemplate,
    },
    computed: mapState({
        contests: (state: any) => state.contests.contests,
    }),
    beforeCreate () {
        if (!this.$store.hasModule('contests')) {
            this.$store.registerModule('contests', contestsModule);
        }
    },
    destroyed() {
        if (this.$store.hasModule('contests')) {
            this.$store.unregisterModule('contests');
        }
    },
    async created() {
        const contests = await this.executeGet<Contest[]>('/admin/contests/relevantInfo');

        if (!this.isError(contests)) {
            this.$store.commit('setContests', contests);
        }
    },
});
</script>
