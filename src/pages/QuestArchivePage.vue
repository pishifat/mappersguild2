<template>
    <div class="row container bg-container py-3">
        <div class="col-lg-12">
            <div class="row small mb-2">
                <div class="col-auto filter-title">
                    Sort
                </div>
                <div class="col">
                    <a
                        :class="sortBy === 'createdAt' ? 'sorted' : 'unsorted'"
                        href="#"
                        @click.prevent="sort('createdAt')"
                        >Date added</a
                    >
                    <a
                        :class="sortBy === 'reward' ? 'sorted' : 'unsorted'"
                        href="#"
                        @click.prevent="sort('reward')"
                        >Reward</a
                    >
                    <a
                        :class="sortBy === 'minParty' ? 'sorted' : 'unsorted'"
                        href="#"
                        @click.prevent="sort('minParty')"
                        >Required party size</a
                    >
                </div>
            </div>
            <div class="linear-divisor"></div>

            <transition-group name="list" tag="div" class="row">
                <quest-card
                    v-for="quest in completeQuests"
                    :key="quest.id"
                    :quest="quest"
                    @update:selectedQuest="selectedQuest = $event"
                ></quest-card>
            </transition-group>
        </div>

        <quest-info :quest="selectedQuest"></quest-info>
        <notifications-access></notifications-access>
    </div>
</template>

<script>
import QuestCard from '../components/quests/QuestCard.vue';
import QuestInfo from '../components/quests/QuestInfo.vue';
import NotificationsAccess from '../components/NotificationsAccess.vue';

export default {
    name: 'quest-archive-page',
    components: {
        QuestCard,
        QuestInfo,
        NotificationsAccess,
    },
    methods: {
        sort: function(field, keepOrder) {
            this.sortBy = field;
            if (!keepOrder) {
                this.asc = !this.asc;
            }

            if (field == 'createdAt') {
                this.completeQuests.sort((a, b) => {
                    if (this.asc) {
                        if (a.createdAt > b.createdAt) return 1;
                        if (a.createdAt < b.createdAt) return -1;
                    } else {
                        if (a.createdAt < b.createdAt) return 1;
                        if (a.createdAt > b.createdAt) return -1;
                    }
                    return 0;
                });
            } else if (field == 'reward') {
                this.completeQuests.sort((a, b) => {
                    if (this.asc) {
                        if (a.reward > b.reward) return 1;
                        if (a.reward < b.reward) return -1;
                    } else {
                        if (a.reward < b.reward) return 1;
                        if (a.reward > b.reward) return -1;
                    }
                    return 0;
                });
            } else if (field == 'minParty') {
                this.completeQuests.sort((a, b) => {
                    if (this.asc) {
                        if (a.minParty > b.minParty) return 1;
                        if (a.minParty < b.minParty) return -1;
                    } else {
                        if (a.minParty < b.minParty) return 1;
                        if (a.minParty > b.minParty) return -1;
                    }
                    return 0;
                });
            }
        },
    },
    data() {
        return {
            completeQuests: null,
            selectedQuest: null,
            sortBy: null,
            asc: false,
        };
    },
    created() {
        axios
            .get('/questsarchive/quests')
            .then(response => {
                this.completeQuests = response.data;
            })
            .then(function() {
                $('#loading').fadeOut();
                $('#app')
                    .attr('style', 'visibility: visible')
                    .hide()
                    .fadeIn();
            });
    },
    mounted() {
        setInterval(() => {
            axios.get('/questsarchive/quests').then(response => {
                this.completeQuests = response.data;
            });
        }, 300000);
    },
};
</script>

<style>
</style>
