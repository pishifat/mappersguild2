<template>
<div>
	<div class="container bg-container py-3 mb-2">
		<div>
        <div class="row mb-2">
            <div class="col">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <div class="input-group-text">
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                    <input
                        class="form-control"
                        type="text"
                        maxlength="48"
                        placeholder="quest..."
                        autocomplete="off"
                        v-model="filterValue"
                    />
                    <div class="input-group-append">
                        <slot></slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
	</div>
	<div v-if="openQuests" class="container bg-container py-1">
		<div class="row">
			<div class="col">
				<h5 class="ml-4 mt-2">
					<a href="#open" data-toggle="collapse" >
						Open quests ({{openQuests.length}})
						<i class="fas fa-angle-down" />
					</a>
				</h5>
				<div id="open" class="show">
					<transition-group name="list" tag="div" class="row">
						<new-quest-card
							v-for="quest in openQuests"
							:key="quest.id"
							:quest="quest"
                            :userId="userId"
                            @update-quest="updateQuest($event)"
						></new-quest-card>
					</transition-group>
				</div>
				
			</div>
		</div>
	</div>
	
	<div class="radial-divisor mx-auto my-4"></div>

	<div v-if="wipQuests" class="container bg-container py-1">
		<div class="row">
			<div class="col">
				<h5 class="ml-4 mt-2">
					<a href="#wip" data-toggle="collapse" >
						Work-in-progress quests ({{wipQuests.length}})
						<i class="fas fa-angle-down" />
					</a>
				</h5>
				<div id="wip" class="collapse">
					<transition-group name="list" tag="div" class="row">
						<new-quest-card
							v-for="quest in wipQuests"
							:key="quest.id"
							:quest="quest"
                            :userId="userId"
                            @update-quest="updateQuest($event)"
						></new-quest-card>
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
                    <a href="#" @click.prevent="loadComplete()">Load complete quests</a>
                </h5>
				<h5 v-else class="ml-4 mt-2">
					<a href="#complete" data-toggle="collapse" >
						Complete quests ({{completeQuests.length}})
						<i class="fas fa-angle-down" />
					</a>
				</h5>
				<div id="complete" class="show">
					<transition-group name="list" tag="div" class="row">
						<new-quest-card
							v-for="quest in completeQuests"
							:key="quest.id"
							:quest="quest"
                            @update-quest="updateQuest($event)"
						></new-quest-card>
					</transition-group>
				</div>
            </div>
		</div>
	</div>
</div>
</template>

<script>
import NewQuestCard from '../components/quests/NewQuestCard.vue';

export default {
    name: 'quest-page',
    components: {
        NewQuestCard
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
            this.allActiveQuests.forEach(quest => {
                if(quest.status == 'open'){
                    this.openQuests.push(quest);
                }else{
                    this.wipQuests.push(quest);
                }
            });
        },
        loadComplete: async function() {
            axios
            .get('/quests/loadComplete')
            .then(response => {
                this.completeQuests = response.data.complete;
            });
        },
        updateQuest: function(quest) {
            const i = this.allActiveQuests.findIndex(q => q.id == quest.id);
            this.allActiveQuests[i] = quest;
            this.separateObjs();
        },
    },
    data() {
        return {
            filterValue: '',
            allActiveQuests: null,
            openQuests: null,
            wipQuests: null,
            completeQuests: null,
            userId: null,
        };
    },
    created() {
        axios
            .get('/quests/relevantInfo')
            .then(response => {
                this.allActiveQuests = response.data.all;
                this.userId = response.data.userId;
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
