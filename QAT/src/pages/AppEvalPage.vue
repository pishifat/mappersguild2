<template>

<div class="row">
    <div class="col-md-12">
        <h2>Applicants</h2> 
        <transition-group name="list" tag="div" class="row">
            <eval-card
                v-for="applicant in applicants"
                :applicant="applicant"
                :key="applicant.id"
                @update:selectedApplicant="selectedApplicant = $event"
            ></eval-card>
        </transition-group>
        <p v-if="!applicants || applicants.length == 0" class="ml-4">No applicants...</p>
    </div>

    <eval-info
        :applicant="selectedApplicant"
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
        
    },
    data() {
        return {
            applicants: null,
            selectedApplicant: null,
            info: '',
        }
    },
    created() {
        axios
            .get('/qat/appEval/relevantInfo')
            .then(response => {
                this.applicants = response.data.applicants;
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
                    this.applicants = response.data.applicants;
                });
        }, 300000);
    }
}
</script>