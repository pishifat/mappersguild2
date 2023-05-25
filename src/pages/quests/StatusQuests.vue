<template>
    <div class="container card card-body my-2">
        <h5 :class="collapsed ? 'mb-0' : 'mb-2'">
            <a
                :href="'#' + status"
                data-bs-toggle="collapse"
                @click.prevent="collapsed = !collapsed"
            >
                {{ status }} quests ({{ questCount }})
                <i class="fas" :class="collapsed ? 'fa-angle-up' : 'fa-angle-down'" />
            </a>
        </h5>
        <div
            :id="status"
            class="row show"
            :class="{
                'loading-data': (isLoadingQuests && isFirstLoadDone),
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
            <div class="text-center">
                <button
                    v-bs-tooltip="'this can take a few seconds. searching for a specific artist is probably better'"
                    class="btn btn-sm btn-primary"
                    type="button"
                    :disabled="isLoadingQuests"
                    @click="showAll()"
                >
                    <i class="fas fa-angle-down me-1" />
                        show all quests
                    <i class="fas fa-angle-down ms-1" />
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'vuex';
import { Quest } from '@interfaces/quest';
import QuestCard from '@components/quests/QuestCard.vue';

export default defineComponent({
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
            collapsed: false,
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
    methods: {
        ...mapActions('quests', [
            'searchQuests',
        ]),
        showAll (): void {
            this.searchQuests(true);
        },
    },
});
</script>
