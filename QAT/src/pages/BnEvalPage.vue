<template>

<div class="row">
    <div class="col-md-12">
        <h2>Pending 
            <button
            class="btn btn-qat-logo"
            data-toggle="modal"
            data-target="#addEvalRounds"
            @click="openAddEvalRounds()"
          >Add users to evaluate</button>
        </h2> 
        
        <p class="ml-4">No applications...</p>
    </div>

    

</div>

</template>



<script>
/*<transition-group name="list" tag="div" class="row">
            <eval-card
                v-for="evalRound in evalRounds"
                :eval-round="evalRound"
                :evaluator="evaluator"
                :key="evalRound.id"
                @update:selectedEvalRound="selectedEvalRound = $event"
            ></eval-card>
        </transition-group>
        
        <eval-info
        :eval-round="selectedEvalRound"
        :evaluator="evaluator"
        @update-eval-round="updateEvalRound($event)"
    ></eval-info>*/
import EvalCard from '../components/evaluations/EvalCard.vue';
import EvalInfo from '../components/evaluations/EvalInfo.vue';

export default {
    name: 'bn-eval-page',
    components: {
        EvalCard,
        EvalInfo
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
        
    },
    data() {
        return {
            applications: null,
            selectedApplication: null,
            evaluator: null,
            info: '',
        }
    },
    created() {
        axios
            .get('/qat/bnEval/relevantInfo')
            .then(response => {
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
                   
                });
        }, 300000);
    }
}
</script>