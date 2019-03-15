<template>

<div class="row">
    <div class="col-md-12">
        <h2>Individual Evaluations</h2> 
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

    <eval-info
        :application="selectedApplication"
        :evaluator="evaluator"
        @update-application="updateApplication($event)"
    ></eval-info>

</div>

</template>

<script>
import EvalCard from '../components/evaluations/EvalCard.vue';
import EvalInfo from '../components/evaluations/EvalInfo.vue';

export default {
    name: 'app-eval-page',
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
            .get('/qat/appEval/relevantInfo')
            .then(response => {
                this.applications = response.data.applications;
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
                    this.applications = response.data.applications;
                    this.evaluator = response.data.evaluator;
                });
        }, 300000);
    }
}
</script>