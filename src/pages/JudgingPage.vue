<template>
    <div>
        <p>hello</p>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
//import ToastMessages from '@components/ToastMessages.vue';

export default Vue.extend({
    name: 'JudgingPage',
    components: {
        //ToastMessages,
    },
    async created () {
        const res: any = await this.executeGet('/judging/relevantInfo');

        if (res) {
            //this.$store.commit('setArtists', res.artists);
            //this.$store.commit('setUserId', res.userId);
        }

        $('#loading').fadeOut();
        $('#app')
            .attr('style', 'visibility: visible')
            .hide()
            .fadeIn();
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
