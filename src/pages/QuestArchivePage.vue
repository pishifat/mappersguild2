<template>

<div class="row">
    <div class="col-lg-12">
        <h2>Completed</h2>
        <small>Sort: 
            <a :class="sortBy === 'createdAt' ? 'sorted' : ''" href="#" @click.prevent="sort('createdAt')">Date added</a> | 
            <a :class="sortBy === 'reward' ? 'sorted' : ''" href="#" @click.prevent="sort('reward')">Reward</a> | 
            <a :class="sortBy === 'minParty' ? 'sorted' : ''" href="#" @click.prevent="sort('minParty')">Required party size</a>
        </small>
        <div id="completeQuests">
            <transition-group name="list" tag="div" class="row">
                <quest-card
                    v-for="quest in completeQuests" 
                    :key="quest.id"
                    :quest="quest"
                    @update:selectedQuest="selectedQuest = $event"
                ></quest-card>
            </transition-group>
        </div>
    </div>

    <quest-info
        :quest="selectedQuest"
    ></quest-info>
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
        NotificationsAccess
    },
    methods: {
        sort: function (field, keepOrder) {
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
						if (a.createdAt > b.createdAt) return -1
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
						if (a.reward > b.reward) return -1
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
						if (a.minParty > b.minParty) return -1
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
        }
    },
    created() {
        axios
            .get('/questsarchive/quests')
            .then(response => {
                this.completeQuests = response.data;
            }).then(function(){
                $("#loading").fadeOut();
				$("#app").attr("style", "visibility: visible").hide().fadeIn();
			});
    },
    mounted () {
        setInterval(() => {
             axios
            .get('/questsarchive/quests')
            .then(response => {
                this.completeQuests = response.data;
            });
        }, 300000);
    }
}
</script>

<style>

</style>
