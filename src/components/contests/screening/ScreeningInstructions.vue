<template>
    <div class="mb-2">
        <ol>
            <li>Mark your personal <b>top {{ selectedContest.screeningVoteCount }}</b> submissions with stars. <span class="text-secondary">If the contest has a theme/additional rules, consider those when making your choices.</span></li>
            <li>
                Stars
                <i
                    class="fa-star fas text-warning"
                />
                indicate the order of your top {{ selectedContest.screeningVoteCount }}. <span class="text-secondary">The star on the <b>left is the lowest score</b>, while the star on the <b>right is the highest score</b>.</span>
            </li>
            <li>Submissions are sorted randomly every time you load the page. <span class="text-secondary">You can use the <i class="fa-solid fa-strikethrough" /> button to mark maps you've checked (only for your own reference).</span></li>
            <li>Comments are not required. <span class="text-secondary">They're nice to include though, especially for your top picks and for new mappers. Comments will be seen by the map creator, but your name will be anonymous.</span></li>
            <li class="text-danger"><b>DO NOT discuss your choices with other screeners or outsiders until after the contest is concluded.</b></li>
        </ol>
    </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ScreeningInstructions',
    computed: {
        ...mapGetters([
            'selectedContest',
        ]),
    },
});
</script>