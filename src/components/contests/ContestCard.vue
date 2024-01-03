<template>
    <div @click="selectContest()">
        <div
            class="card card-hover card-level-2 card-body"
        >
            <div class="mb-2">
                <span class="me-1">
                    <modes-icons
                        v-if="contest.mode"
                        :modes="[contest.mode]"
                        color="secondary"
                    />
            </span>
                <a v-if="contest.url && contest.url.length" :href="contest.url" target="_blank">
                    {{ contest.name }}
                </a>
                <span v-else>
                    {{ contest.name }}
                </span>
            </div>

            <div class="text-secondary">
                {{ contest.status == 'complete' || contest.status == 'hidden' || contest.status == 'locked' ? contest.status : contest.status + ' phase' }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Contest } from '@interfaces/contest/contest';
import ModesIcons from '@components/ModesIcons.vue';

export default defineComponent({
    name: 'ContestCard',
    components: {
        ModesIcons,
    },
    props: {
        contest: {
            type: Object as PropType<Contest>,
            required: true,
        },
        route: {
            type: String,
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

            if (this.$route.query.id !== this.contest.id) {
                this.$router.replace(`/contests/${this.route}?contest=${this.contest.id}`);
            }
        },
    },
});
</script>