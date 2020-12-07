<template>
    <div class="container card card-body py-1">
        <div class="row">
            <div class="col-sm">
                <h5 class="ml-4 mt-2">
                    <a :href="'#' + status" data-toggle="collapse">
                        {{ status }} quests ({{
                            status === 'Open' && !isFirstLoadDone ? quests.length :
                            !isLoadingQuests ? quests.length : '...'
                        }})
                        <i class="fas fa-angle-down" />
                    </a>
                </h5>

                <transition-group
                    :id="status"
                    name="list"
                    tag="div"
                    :class="{
                        'loading-data': (isLoadingQuests && isFirstLoadDone),
                        'show': (status === 'Open'),
                        'collapse': (status !== 'Open')
                    }"
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
import { Quest } from '../../../interfaces/quest';
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
        availablePoints: {
            type: Number,
            default: 0,
        },
        isFirstLoadDone: Boolean,
    },
    computed: mapState({
        isLoadingQuests: (state: any) => state.quests.isLoadingQuests,
    }),
});
</script>
