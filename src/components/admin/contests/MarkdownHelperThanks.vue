<template>
    <copy-paste>
        Thanks to
        <span v-for="(screener, i) in screeners" :key="screener.id">
            [{{ screener.username }}](https://osu.ppy.sh/users/{{ screener.osuId }}){{ i === screeners.length - 2 ? ', and ' : i === screeners.length - 1 ? '' : ', ' }}
        </span>
        for screening this month's entries, as well as
        <span v-for="(judge, i) in judges" :key="'j-' + judge.id">
            [{{ judge.username }}](https://osu.ppy.sh/users/{{ judge.osuId }}){{ i === judges.length - 2 ? ', and ' : i === judges.length - 1 ? '' : ', ' }}
        </span>
        for judging this month's finalists!
    </copy-paste>
</template>

<script lang="ts">
import Vue from 'vue';
import CopyPaste from '../../CopyPaste.vue';

export default Vue.extend({
    name: 'MarkdownHelperThanks',
    components: {
        CopyPaste,
    },
    props: {
        screeners: {
            type: Array,
            default() {
                return [];
            },
        },
        judges: {
            type: Array,
            default() {
                return [];
            },
        },
    },
});
</script>
