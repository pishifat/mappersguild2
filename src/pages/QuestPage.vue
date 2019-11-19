<template>
<div>
    <div class="container bg-container py-3 mb-2">
        <filter-box
            :filterValue.sync="filterValue"
            :filterMode.sync="filterMode"
            placeholder="quest name..."
        >
        </filter-box>
    </div>
	<div class="container bg-container py-1">
		<div class="row">
			<div class="col">
                <h5 v-if="!openQuests" class="ml-4 mt-2">
                    <a href="#" @click.prevent>Loading open quests...</a>
                </h5>
				<h5 v-else class="ml-4 mt-2">
					<a href="#open" data-toggle="collapse" >
						Open quests ({{openQuests.length}})
						<i class="fas fa-angle-down" />
					</a>
				</h5>
				<div id="open" class="show">
					<transition-group name="list" tag="div" class="row">
						<quest-card
							v-for="quest in openQuests"
							:key="quest.id"
							:quest="quest"
                            :userId="userId"
                            @update-quest="updateQuest($event)"
						></quest-card>
					</transition-group>
				</div>
				
			</div>
		</div>
	</div>
	
	<div class="radial-divisor mx-auto my-4"></div>

	<div class="container bg-container py-1">
		<div class="row">
			<div class="col">
                <h5 v-if="!wipQuests" class="ml-4 mt-2">
                    <a href="#" @click.prevent>Loading work-in-progress quests...</a>
                </h5>
				<h5 v-else class="ml-4 mt-2">
					<a href="#wip" data-toggle="collapse" >
						Work-in-progress quests ({{wipQuests.length}})
						<i class="fas fa-angle-down" />
					</a>
				</h5>
				<div id="wip" class="collapse">
					<transition-group name="list" tag="div" class="row">
						<quest-card
							v-for="quest in wipQuests"
							:key="quest.id"
							:quest="quest"
                            :userId="userId"
                            @update-quest="updateQuest($event)"
						></quest-card>
					</transition-group>
				</div>
            </div>
		</div>
	</div>

    <div class="radial-divisor mx-auto my-4"></div>

	<div class="container bg-container py-1">
		<div class="row">
			<div class="col">
                <h5 v-if="!completeQuests" class="ml-4 mt-2">
                    <a href="#" @click.prevent>Loading complete quests...</a>
                </h5>
				<h5 v-else class="ml-4 mt-2">
					<a href="#complete" data-toggle="collapse" >
						Complete quests ({{completeQuests.length}})
						<i class="fas fa-angle-down" />
					</a>
				</h5>
				<div id="complete" class="collapse">
					<transition-group name="list" tag="div" class="row">
						<quest-card
							v-for="quest in completeQuests"
							:key="quest.id"
							:quest="quest"
                            @update-quest="updateQuest($event)"
						></quest-card>
					</transition-group>
				</div>
            </div>
		</div>
	</div>
    
    <notifications-access v-if="usergroup != 'spectator'"></notifications-access>

</div>
</template>

<script>
import QuestCard from '../components/quests/QuestCard.vue';
import FilterBox from '../components/FilterBox.vue';
import NotificationsAccess from '../components/NotificationsAccess.vue';

export default {
    name: 'quest-page',
    components: {
        QuestCard,
        FilterBox,
        NotificationsAccess
    },
    watch: {
        filterValue: function(v) {
            this.filter();
        },
        filterMode: async function(v) {
            let mode = this.filterMode;
            if(!this.filterMode.length) mode = 'any';
            axios
                .get('/quests/loadQuests/' + mode)
                .then(response => {
                    this.allObjs = response.data.all;
                    this.pageObjs = response.data.all;
                    this.filter();
            })
        },
    },
    methods: {
        executePost: async function(path, data, e) {
            if (e) e.target.disabled = true;

            try {
                const res = await axios.post(path, data);

                if (res.data.error) {
                    this.info = res.data.error;
                } else {
                    if (e) e.target.disabled = false;
                    return res.data;
                }
            } catch (error) {
                this.info = 'Something went wrong';
            }
            if (e) e.target.disabled = false;
        },
        separateObjs: function() {
            this.openQuests = [];
            this.wipQuests = [];
            this.completeQuests = [];
            this.pageObjs.forEach(quest => {
                if(quest.status == 'open'){
                    this.openQuests.push(quest);
                }else if(quest.status == 'wip'){
                    this.wipQuests.push(quest);
                }else{
                    this.completeQuests.push(quest);
                }
            });
        },
        updateQuest: function(quest) {
            const i = this.allObjs.findIndex(q => q.id == quest.id);
            this.allObjs[i] = quest;
            this.filter();
        },
        filter: function() {
            this.pageObjs = this.allObjs;
            //search
            if (this.filterValue.length > 2) {
                this.pageObjs = this.allObjs.filter(q => {
                    if (q.name.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1) {
                        return true;
                    }
                    return false;
                });
            }
            //mode
            if (this.filterMode.length) {
                if (this.isFiltered) {
                    this.pageObjs = this.pageObjs.filter(q => {
                        if(q.modes){
                            if (q.modes.indexOf(this.filterMode) >= 0) {
                                return true;
                            }
                        }
                        return false;
                    });
                } else {
                    this.pageObjs = this.allObjs.filter(q => {
                        if(q.modes){
                            if (q.modes.indexOf(this.filterMode) >= 0) {
                                return true;
                            }
                        }
                        return false;
                    });
                }
            }
            this.isFiltered = this.filterValue.length > 2 || this.filterMode.length;
            this.separateObjs();
        },
    },
    data() {
        return {
            filterValue: '',
            filterMode: '',
            isFiltered: false,
            allObjs: null,
            pageObjs: null,
            openQuests: null,
            wipQuests: null,
            completeQuests: null,
            loadingCompleteQuests: false,
            userId: null,
            usergroup: null,
        };
    },
    created() {
        axios
            .get('/quests/relevantInfo')
            .then(response => {
                this.allObjs = response.data.all;
                this.pageObjs = response.data.all;
                this.userId = response.data.userId;
                this.usergroup = response.data.group;
                this.filterMode = response.data.mainMode;
                this.separateObjs();
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
        
    },
};
</script>

<style>
.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}
</style>
