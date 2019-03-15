<template>

<div class="row">
    <div class="col-md-12">
        <h2>Individual Evaluations<sup style="font-size: 12pt" data-toggle="tooltip" data-placement="top" title="only you can see these">?</sup></h2> 
        <transition-group name="list" tag="div" class="row">
            <eval-card
                v-for="application in applications"
                :application="application"
                :evaluator="evaluator"
                :key="application.id"
                @update:selectedApplication="selectedApplication = $event"
            ></eval-card>
        </transition-group>
        <p v-if="!applications || applications.length == 0" class="ml-4">No applications...</p>
    </div>

    <div class="col-md-12">
        <h2>Group Evaluations<sup style="font-size: 12pt" data-toggle="tooltip" data-placement="top" title="everyone can see these">?</sup></h2>
        <div class="mb-2">
            <small>Search: 
                <input id="search" v-model="filterValue" type="text" placeholder="username... (3+ characters)" style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000); width: 200px;" /> 
            </small>
            <small>
                <select class="custom-select select-arrow-filter ml-2 small" id="mode" v-model="filterMode" style="font-size: 10pt; border-radius: 5px 5px 5px 5px; width: 100px; padding: 0 0 0 0; height: 26px;">
                    <option value="" selected>All modes</option>
                    <option value="osu">osu!</option>
                    <option value="taiko">osu!taiko</option>
                    <option value="catch">osu!catch</option>
                    <option value="mania">osu!mania</option>
                </select>
            </small> 
        </div>
        

        <transition-group name="list" tag="div" class="row">
            <discuss-card
                v-for="discussApp in discussApps"
                :discuss-app="discussApp"
                :evaluator="evaluator"
                :key="discussApp.id"
                @update:selectedDiscussApp="selectedDiscussApp = $event"
            ></discuss-card>
        </transition-group>
        
        <p v-if="!discussApps || discussApps.length == 0" class="ml-4">No BNs to evaluate...</p>
    </div>

    <eval-info
        :application="selectedApplication"
        :evaluator="evaluator"
        @update-application="updateApplication($event)"
    ></eval-info>

    <discuss-info
        :discussApp="selectedDiscussApp"
        :evaluator="evaluator"
        @update-discuss-app="updateDiscussApp($event)"
    ></discuss-info>

</div>

</template>

<script>
import EvalCard from '../components/evaluations/EvalCard.vue';
import EvalInfo from '../components/evaluations/EvalInfo.vue';
import DiscussCard from '../components/evaluations/DiscussCard.vue';
import DiscussInfo from '../components/evaluations/DiscussInfo.vue';

export default {
    name: 'app-eval-page',
    components: {
        EvalCard,
        EvalInfo,
        DiscussCard,
        DiscussInfo
    },
    watch: {
        filterValue: function(v){
            this.filter();
        },
        filterMode: function(v) {
            this.filter();
        },
    },
    methods: {
        executePost: async function (path, data, e) {
            if (e) e.target.disabled = true;

            try {
                const res = await axios.post(path, data)
                
                if (res.data.error) {
                    this.info = res.data.error;
                } else {
                    if (e) e.target.disabled = false;
                    return res.data;
                }
            } catch (error) {
                console.log(error)
            }

            if (e) e.target.disabled = false;
        },
        updateApplication: function (application) {
			const i = this.applications.findIndex(a => a.id == application.id);
			this.applications[i] = application;
			this.selectedApplication = application;
        },
        updateDiscussApp: function (discussApp) {
			const i = this.allDiscussApps.findIndex(a => a.id == discussApp.id);
			this.allDiscussApps[i] = discussApp;
            this.selectedDiscussApp = discussApp;
            this.filter();
        },
        filter: function () {            
            this.filterValue = $("#search").val();
            this.filterMode = $("#mode").val();
            this.discussApps = this.allDiscussApps;

            //search
            if(this.filterValue.length > 2){
                this.filteredDiscussApps = this.allDiscussApps.filter(dr => {
                    if(dr.bn.username.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1){
                        return true;
                    }
                    return false;
                });
            }
            
            //mode
            if(this.filterMode.length){
                if(this.filterValue.length > 2){
                    this.filteredDiscussApps = this.filteredDiscussApps.filter(dr => {
                        if(this.filterMode == "osu" && dr.mode == 'osu'){
                            return true;
                        }
                        if(this.filterMode == "taiko" && dr.mode == 'taiko'){
                            return true;
                        }
                        if(this.filterMode == "catch" && dr.mode == 'catch'){
                            return true;
                        }
                        if(this.filterMode == "mania" && dr.mode == 'mania'){
                            return true;
                        }
                        return false;
                    });
                    
                }else{
                    this.filteredDiscussApps = this.allDiscussApps.filter(dr => {
                        if(this.filterMode == "osu" && dr.mode == 'osu'){
                            return true;
                        }
                        if(this.filterMode == "taiko" && dr.mode == 'taiko'){
                            return true;
                        }
                        if(this.filterMode == "catch" && dr.mode == 'catch'){
                            return true;
                        }
                        if(this.filterMode == "mania" && dr.mode == 'mania'){
                            return true;
                        }
                        return false;
                    });
                }
            }
            
            this.isFiltered = (this.filterValue.length > 2 || this.filterMode.length);
            if(this.isFiltered){
                this.discussApps = this.filteredDiscussApps;
            }
        },
        
    },
    data() {
        return {
            applications: null,
            selectedApplication: null,
            discussApps: null,
            allDiscussApps: null,
            filteredDiscussApps: null,
            selectedDiscussApp: null,
            evaluator: null,
            info: '',
            filterValue: '',
            filterMode: '',
        }
    },
    created() {
        axios
            .get('/qat/appEval/relevantInfo')
            .then(response => {
                this.applications = response.data.a;
                this.allDiscussApps = response.data.da;
                this.discussApps = response.data.da;
                this.evaluator = response.data.evaluator;
            }).then(function(){
                $("#loading").fadeOut();
                $("#app").attr("style", "visibility: visible").hide().fadeIn();
            });
    },
    mounted () {
        setInterval(() => {
            axios
                .get('/qat/appEval/relevantInfo')
                .then(response => {
                    this.applications = response.data.a;
                    this.allDiscussApps = response.data.da;
                });
        }, 300000);
    }
}
</script>