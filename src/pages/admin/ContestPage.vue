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
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import ContestInfo from '@components/admin/contests/ContestInfo.vue';
import AddContest from '@components/admin/contests/AddContest.vue';
import MarkdownNewContestTemplate from '@components/admin/contests/MarkdownNewContestTemplate.vue';
import { Contest } from '@interfaces/contest/contest';
import contestsModule from '@store/admin/contests';

export default defineComponent({
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
    unmounted () {
        if (this.$store.hasModule('contests')) {
            this.$store.unregisterModule('contests');
        }
    },
    async created() {
        const contests = await this.$http.initialRequest<Contest[]>('/admin/contests/relevantInfo');

        if (!this.$http.isError(contests)) {
            this.$store.commit('setContests', contests);
        }
    },
});
</script>
