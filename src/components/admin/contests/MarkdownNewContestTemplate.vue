<template>
    <div class="container card card-body py-3 mb-2">
        <button
            type="button"
            class="btn w-100 btn-info"
            @click="show = !show"
        >
            {{ show ? 'Hide new contest news post template' : 'Show new contest news post template' }}
        </button>
        <copy-paste v-if="show" style="white-space: pre-line">
            ---
            layout: post
            title: "Monthly Beatmapping Contest: `MONTH`"
            date: 2020-08-08 11:00:00 +0000
            ---

            `HOOK`

            ![](/wiki/shared/news/banners/monthly-beatmapping-contest.png)

            `Monthly Beatmapping Contest (*MBC*)` / `[Monthly Beatmapping Contest wiki article](/wiki/Contests/Monthly_Beatmapping_Contest)`

            ## Schedule

            - **Beatmapping (3 weeks):** Contest is announced at the start of the month and beatmappers create their entries.
            - **Screening (1.5 week):** Competitive entries are selected by experienced beatmappers.
            - **Judging (1.5 weeks):** Competitive entries are judged by different experienced beatmappers.
            - **Rewards:** Winners are announced and prizes are redeemed, including osu!supporter, profile badges, and the *Elite Mapper* user title!

            `LAST MONTH'S RESULTS IN ~2 WEEKS`

            ## Beatmapping

            ### &lt;a id="limitation"&gt;Limitation

            `MBC MORE INTERESTING WITH LIMITATIONS. EXAMPLES OF PREVIOUS LIMITATIONS`

            This month's limitation: **`LIMITATION`.**

            `FLAVOR`

            ### &lt;a id="songs"&gt;Songs

            Each MBC provides beatmappers a choice between 5 songs from one of osu!'s [Featured Artists](https://osu.ppy.sh/beatmaps/artists).

            This month's artist is `[**ARTIST**](LINK)`, and the following songs are viable for contest submissions:
            <span v-for="i in 4" :key="i">
                #### `SONG` (`NUM` BPM)

                [Beatmap template download](`LINK`) (`X:XX`)

                &lt;audio controls&gt;
                &lt;source src="LINK" type="audio/mpeg"&gt;
                &lt;/audio&gt;
            </span>
            ## Rules

            So how do you participate? Submissions must...

            - **follow the month's [beatmapping limitation](#limitation): *`LIMITATION`.***
            - **be in `.osz` format.** This allows your entry to use custom hitsound files and a background of your choice, however storyboarded visuals will be removed from all submissions.
            - **be a single difficulty for one of the month's [selected songs](#songs).**
            - **be in the osu! game mode.**
            - **not be uploaded to the osu! website through the Beatmap Submission System (*BSS*).** All contest submissions are anonymous during the screening/judging phases to avoid bias. **DO NOT SHARE YOUR ENTRY!**
            - **be solely created by you.** Collaborations are not allowed.
            - **abide by the [ranking criteria](/wiki/Ranking_Criteria).** While we can be forgiving for mistakes, submissions that could not be ranked without major changes will be discarded.

            Any entries breaking these rules will not be viable for the contest.

            ## Submission

            `CONTEST IS OPEN`

            `WHEN READY SUBMIT` [contest listing](`LINK`) `3 WEEKS`

            `SIGNOFF`

            —pishifat
        </copy-paste>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CopyPaste from '../../CopyPaste.vue';

export default Vue.extend({
    name: 'MarkdownNewContestTemplate',
    components: {
        CopyPaste,
    },
    data () {
        return {
            show: false,
        };
    },
});
</script>
