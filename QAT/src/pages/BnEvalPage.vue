<template>

<div class="row">
    <div class="col-md-12 mb-4">
        <h2>Individual Evaluations<sup style="font-size: 12pt" data-toggle="tooltip" data-placement="top" title="only you can see these">?</sup> 
            <button
            class="btn btn-qat"
            data-toggle="modal"
            data-target="#addEvalRounds"
            @click="openAddEvalRounds()"
          >Add users to evaluate</button>
        </h2>

        <transition-group name="list" tag="div" class="row">
            <eval-card
                v-for="evalRound in evalRounds"
                :eval-round="evalRound"
                :evaluator="evaluator"
                :key="evalRound.id"
                @update:selectedEvalRound="selectedEvalRound = $event"
            ></eval-card>
        </transition-group>
        
        <p v-if="!evalRounds || evalRounds.length == 0" class="ml-4">No BNs to evaluate...</p>
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
                v-for="discussRound in discussRounds"
                :discuss-round="discussRound"
                :evaluator="evaluator"
                :key="discussRound.id"
                @update:selectedDiscussRound="selectedDiscussRound = $event"
            ></discuss-card>
        </transition-group>
        
        <p v-if="!discussRounds || discussRounds.length == 0" class="ml-4">No BNs to evaluate...</p>
    </div>
    
    <eval-info
        :evalRound="selectedEvalRound"
        :evaluator="evaluator"
        @update-eval-round="updateEvalRound($event)"
    ></eval-info>

    <discuss-info
        :discussRound="selectedDiscussRound"
        :evaluator="evaluator"
        @update-discuss-round="updateDiscussRound($event)"
    ></discuss-info>

    <add-eval-rounds
        @update-all-eval-rounds="updateAllEvalRounds($event)"
    ></add-eval-rounds>

</div>

</template>



<script>
import AddEvalRounds from '../components/evaluations/AddEvalRounds.vue';
import EvalCard from '../components/evaluations/EvalCard.vue';
import EvalInfo from '../components/evaluations/EvalInfo.vue';
import DiscussCard from '../components/evaluations/DiscussCard.vue';
import DiscussInfo from '../components/evaluations/DiscussInfo.vue';

export default {
    name: 'bn-eval-page',
    components: {
        AddEvalRounds,
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
        updateEvalRound: function (evalRound) {
			const i = this.evalRounds.findIndex(er => er.id == evalRound.id);
			this.evalRounds[i] = evalRound;
			this.selectedEvalRound = evalRound;
        },
        updateDiscussRound: function (discussRound) {
			const i = this.allDiscussRounds.findIndex(dr => dr.id == discussRound.id);
			this.discussRounds[i] = discussRound;
            this.selectedDiscussRound = discussRound;
            this.filter();
        },
        updateAllEvalRounds: function (evalRounds) {
			this.evalRounds = evalRounds;
		},
        openAddEvalRounds: function() {
            $('input[type=checkbox]').each(function() {
                this.checked = false;
            });
        },
        filter: function () {            
            this.filterValue = $("#search").val();
            this.filterMode = $("#mode").val();
            this.discussRounds = this.allDiscussRounds;

            //search
            if(this.filterValue.length > 2){
                this.filteredDiscussRounds = this.allDiscussRounds.filter(dr => {
                    if(dr.bn.username.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1){
                        return true;
                    }
                    return false;
                });
            }
            
            //mode
            if(this.filterMode.length){
                if(this.filterValue.length > 2){
                    this.filteredDiscussRounds = this.filteredDiscussRounds.filter(dr => {
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
                    this.filteredDiscussRounds = this.allDiscussRounds.filter(dr => {
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
                this.discussRounds = this.filteredDiscussRounds;
            }
        },
        
    },
    data() {
        return {
            evalRounds: null,
            selectedEvalRound: null,
            discussRounds: null,
            allDiscussRounds: null,
            filteredDiscussRounds: null,
            selectedDiscussRound: null,
            evaluator: null,
            isFiltered: null,
            filterMode: '',
            filterValue: '',
            info: '',
        }
    },
    created() {
        axios
            .get('/qat/bnEval/relevantInfo')
            .then(response => {
                this.evalRounds = response.data.er;
                this.allDiscussRounds = response.data.dr;
                this.discussRounds = response.data.dr;
                this.evaluator = response.data.evaluator;
            }).then(function(){
                $("#loading").fadeOut();
                $("#app").attr("style", "visibility: visible").hide().fadeIn();
            });
    },
    mounted () {
        setInterval(() => {
            axios
                .get('/qat/bnEval/relevantInfo')
                .then(response => {
                    this.evalRounds = response.data.er;
                    this.allDiscussRounds = response.data.dr;
                });
        }, 300000);
    }
}
</script>