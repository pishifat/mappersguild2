<template>
    <div>
        <add-contest />

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
import ToastMessages from '@components/ToastMessages.vue';
import ContestInfo from '@components/admin/contests/ContestInfo.vue';
import AddContest from '@components/admin/contests/AddContest.vue';
import { mapState } from 'vuex';

export default Vue.extend({
    name: 'ContestPage',
    components: {
        ToastMessages,
        ContestInfo,
        AddContest,
    },
    computed: mapState(['contests']),
    async created() {
        const res: any = await this.executeGet('/admin/contests/relevantInfo');

        if (!this.isError(res)) {
            this.$store.commit('setContests', res.contests);
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
    },
});
</script>