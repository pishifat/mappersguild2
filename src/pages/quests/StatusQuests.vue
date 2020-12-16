<template>
    <div class="container card card-body my-2">
        <h5 :class="collapsed ? 'mb-2' : 'mb-0'">
            <a
                :href="'#' + status"
                data-toggle="collapse"
                @click.prevent="collapsed = !collapsed"
            >
                {{ status }} quests ({{ questCount }})
                <i class="fas" :class="collapsed ? 'fa-angle-up' : 'fa-angle-down'" />
            </a>
        </h5>
        <div
            :id="status"
            class="row"
            :class="{
                'loading-data': (isLoadingQuests && isFirstLoadDone),
                'show': openQuests,
                'collapse': !openQuests
            }"
        >
            <div class="col-sm">
                <transition-group
                    name="list"
                    tag="div"
                >
                    <quest-card
                        v-for="quest in quests"
                        :key="quest.id"
                        :quest="quest"
                    />
                </transition-group>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Quest } from '@interfaces/quest';
import QuestCard from '@components/quests/QuestCard.vue';
import { mapState } from 'vuex';

export default Vue.extend({
    components: {
        QuestCard,
    },
    props: {
        status: {
            type: String,
            required: true,
        },
        quests: {
            type: Array as () => Quest[],
            required: true,
        },
    },
    data () {
        return {
            collapsed: this.status === 'Open',
        };
    },
    computed: {
        ...mapState('quests', [
            'isLoadingQuests',
            'isFirstLoadDone',
        ]),
        questCount (): string {
            if ((this.openQuests && !this.isFirstLoadDone) || !this.isLoadingQuests) return this.quests.length.toString();

            return '...';
        },
        openQuests (): boolean {
            return this.status === 'Open';
        },
    },
});
</script>
