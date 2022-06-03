<template>
    <div>
        <contest-header
            :name="contest.name"
            :url="contest.url"
            :creator="contest.creator"
        />

        <h5>General</h5>

        <div v-if="contest.description">
            <div class="small mt-2 bg-dark pt-3 pb-1 px-3 mb-2 rounded" v-html="$md.render(contest.description.trim())" />
        </div>

        <div v-if="contest.status !== 'complete'">
            This contest is currently in the <b>{{ contest.status }}</b> phase.
        </div>

        <div v-if="contest.url">
            <a :href="contest.url" target="_blank">Read more about the contest here!</a>
        </div>

        <hr>

        <div v-if="contest.status !== 'complete'">
            <h5>Submission</h5>

            <div v-if="!contest.osuContestListingUrl">
                <div v-if="new Date(contest.contestEnd) < new Date()">
                    This contest is no longer accepting new submissions.
                </div>

                <div v-else>
                    Maps can be submitted until <code>{{ new Date(contest.contestEnd) }}</code>

                    <map-submission-form
                        class="mt-2"
                        :contest-id="contest.id"
                    />
                </div>
            </div>

            <div v-else>
                This contest is being hosted on <a href="https://osu.ppy.sh/community/contests" target="_blank">osu!'s contest listing</a>. Submit your beatmap on the <a :href="contest.osuContestListingUrl" target="_blank">official contest page</a>!
            </div>
        </div>

        <div v-else>
            <h5>Results</h5>
            <div><a :href="contest.resultsUrl" target="_blank">View contest results here!</a></div>
            <div><a :href="'/contests/results?contest=' + contest.id" target="_blank">View Mappers' Guild judging scores here!</a></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Contest } from '@interfaces/contest/contest';
import ContestHeader from './ContestHeader.vue';
import MapSubmissionForm from './MapSubmissionForm.vue';

export default defineComponent({
    name: 'LimitedContestInfo',
    components: {
        ContestHeader,
        MapSubmissionForm,
    },
    props: {
        contest: {
            type: Object as () => Contest,
            required: true,
        },
    },
});
</script>