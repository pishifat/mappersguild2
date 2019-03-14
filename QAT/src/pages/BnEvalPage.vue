<template>

<div class="row">
    <div class="col-md-12">
        <h2>Pending 
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
    
    <eval-info
        :evalRound="selectedEvalRound"
        :evaluator="evaluator"
        @update-eval-round="updateEvalRound($event)"
    ></eval-info>

    <add-eval-rounds
        @update-all-eval-rounds="updateAllEvalRounds($event)"
    
    ></add-eval-rounds>

</div>

</template>



<script>
/*
        
        <eval-info
        :eval-round="selectedEvalRound"
        :evaluator="evaluator"
        @update-eval-round="updateEvalRound($event)"
    ></eval-info>*/
import EvalCard from '../components/evaluations/EvalCard.vue';
import EvalInfo from '../components/evaluations/EvalInfo.vue';
import AddEvalRounds from '../components/evaluations/AddEvalRounds.vue';

export default {
    name: 'bn-eval-page',
    components: {
        EvalCard,
        EvalInfo,
        AddEvalRounds
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
        updateAllEvalRounds: function (evalRounds) {
			this.evalRounds = evalRounds;
		},
        openAddEvalRounds: function() {
            $('input[type=checkbox]').each(function() {
                this.checked = false;
            });
        },
        
    },
    data() {
        return {
            evalRounds: null,
            selectedEvalRound: null,
            evaluator: null,
            info: '',
        }
    },
    created() {
        axios
            .get('/qat/bnEval/relevantInfo')
            .then(response => {
                this.evalRounds = response.data.allEvalRounds;
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
                    this.evalRounds = response.data.allEvalRounds;
                });
        }, 300000);
    }
}
</script>