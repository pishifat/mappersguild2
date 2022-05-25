<template>
    <div class="col-sm-12 my-2" @click="selectContest()">
        <div
            class="card card-hover card-level-2 card-body"
        >
            <div class="mb-2">
                <a v-if="contest.url && contest.url.length" :href="contest.url" target="_blank">
                    {{ contest.name }}
                </a>
                <span v-else>
                    {{ contest.name }}
                </span>
            </div>

            <div class="text-secondary">
                {{ contest.status == 'complete' ? 'completed' : contest.status == 'hidden' ? 'hidden' : contest.status + ' phase' }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Contest } from '@interfaces/contest/contest';

export default defineComponent({
    name: 'ContestCard',
    props: {
        contest: {
            type: Object as PropType<Contest>,
            required: true,
        },
    },
    data () {
        return {
            contestName: '',
        };
    },
    methods: {
        selectContest(): void {
            this.$store.commit('setSelectedContestId', this.contest.id);
        },
    },
});
</script>