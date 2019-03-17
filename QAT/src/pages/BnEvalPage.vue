<template>

<div class="row">
    <div class="col-md-12 mb-4">
        <div class="mb-2">
            <small>Search: 
                <input id="search" class="text-input" v-model="filterValue" type="text" placeholder="username... (3+ characters)" /> 
            </small>
            <small>
                <select class="custom-select inline-custom-select ml-2" id="mode" v-model="filterMode">
                    <option value="" selected>All modes</option>
                    <option value="osu">osu!</option>
                    <option value="taiko">osu!taiko</option>
                    <option value="catch">osu!catch</option>
                    <option value="mania">osu!mania</option>
                </select>
            </small> 
        </div>
        <div class="mb-2">
            <small>Mark selected as:
                <button class="btn btn-qat btn-sm ml-2" @click="setGroupEval($event)">Group evaluation</button>
            </small>
            <small>
                <button class="btn btn-qat btn-sm ml-2" @click="setIndividualEval($event)">Individual evaluation</button>
            </small>
            <small>
                <button class="btn btn-qat-red btn-sm ml-2" @click="setComplete($event)">Complete</button>
            </small>
        </div>
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
        :reports="reports"
        @update-eval-round="updateEvalRound($event)"
    ></eval-info>

    <discuss-info
        :discussRound="selectedDiscussRound"
        :evaluator="evaluator"
        :reports="reports"
        @update-eval-round="updateEvalRound($event)"
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
			const i = this.allEvalRounds.findIndex(er => er.id == evalRound.id);
			this.allEvalRounds[i] = evalRound;
            this.selectedEvalRound = evalRound;
            this.selectedDiscussRound = evalRound;
            this.filter();
        },
        updateAllEvalRounds: function (evalRounds) {
            console.log('s')
            this.allEvalRounds = evalRounds;
            this.filter();
		},
        openAddEvalRounds: function() {
            $('input[type=checkbox]').each(function() {
                this.checked = false;
            });
        },
        filter: function () {            
            this.filterValue = $("#search").val();
            this.filterMode = $("#mode").val();
            
            //reset
            this.evalRounds = this.allEvalRounds.filter(er => !er.discussion);
            this.discussRounds = this.allEvalRounds.filter(er => er.discussion);

            //search
            if(this.filterValue.length > 2){
                this.filteredEvalRounds = this.allEvalRounds.filter(er => {
                    if(er.bn.username.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1){
                        return true;
                    }
                    return false;
                });
            }
            
            //mode
            if(this.filterMode.length){
                if(this.filterValue.length > 2){
                    this.filteredEvalRounds = this.filteredEvalRounds.filter(er => {
                        if(this.filterMode == "osu" && er.mode == 'osu') return true;
                        if(this.filterMode == "taiko" && er.mode == 'taiko') return true;
                        if(this.filterMode == "catch" && er.mode == 'catch') return true;
                        if(this.filterMode == "mania" && er.mode == 'mania') return true;
                        return false;
                    });
                }else{
                    this.filteredEvalRounds = this.allEvalRounds.filter(er => {
                        if(this.filterMode == "osu" && er.mode == 'osu') return true;
                        if(this.filterMode == "taiko" && er.mode == 'taiko') return true;
                        if(this.filterMode == "catch" && er.mode == 'catch') return true;
                        if(this.filterMode == "mania" && er.mode == 'mania') return true;
                        return false;
                    });
                }
            }
            
            let isFiltered = (this.filterValue.length > 2 || this.filterMode.length);
            if(isFiltered){
                this.evalRounds = this.filteredEvalRounds.filter(a => !a.discussion);
                this.discussRounds = this.filteredEvalRounds.filter(a => a.discussion);
            }
        },
        setGroupEval: async function(e) {
            let checkedRounds = [];
            $("input[name='evalTypeCheck']:checked").each( function () {
                checkedRounds.push( $(this).val() );
            });
            if(checkedRounds.length){
                const ers = await this.executePost('/qat/bnEval/setGroupEval/', { checkedRounds: checkedRounds}, e);
                if (ers) {
                    this.allEvalRounds = ers;
                    this.filter();
                }
            }
        },
        setIndividualEval: async function(e) {
            let checkedRounds = [];
            $("input[name='evalTypeCheck']:checked").each( function () {
                checkedRounds.push( $(this).val() );
            });
            if(checkedRounds.length){
                const ers = await this.executePost('/qat/bnEval/setIndividualEval/', { checkedRounds: checkedRounds}, e);
                if (ers) {
                    this.allEvalRounds = ers;
                    this.filter();
                }
            }
        },
        setComplete: async function(e) {
            let checkedRounds = [];
            $("input[name='evalTypeCheck']:checked").each( function () {
                checkedRounds.push( $(this).val() );
            });
            if(checkedRounds.length){
                const result = confirm(`Are you sure? This will remove applications from the listing. Only do this when feedback PMs have been sent.`);
                const ers = await this.executePost('/qat/bnEval/setComplete/', { checkedRounds: checkedRounds}, e);
                if (ers) {
                    this.allEvalRounds = ers;
                    this.filter();
                }
            }
        }
    },
    data() {
        return {
            reports: null,
            allEvalRounds: null,
            filteredEvalRounds: null,

            evalRounds: null,
            selectedEvalRound: null,

            discussRounds: null,
            selectedDiscussRound: null,

            evaluator: null,
            filterMode: '',
            filterValue: '',
            info: '',
        }
    },
    created() {
        axios
            .get('/qat/bnEval/relevantInfo')
            .then(response => {
                this.allEvalRounds = response.data.er;
                //this.evalRounds = response.data.er;
                //this.allDiscussRounds = response.data.dr;
                //this.discussRounds = response.data.dr;
                this.reports = response.data.r;
                this.evaluator = response.data.evaluator;
                this.filter();
            }).then(function(){
                $("#loading").fadeOut();
                $(".container").attr("style", "visibility: visible").hide().fadeIn();
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