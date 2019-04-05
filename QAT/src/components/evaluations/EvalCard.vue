<template>
<div class='col-md-2 my-2' @click="selectApplication()" >
    <div class="card custom-bg-dark border-outline" :class="'border-' + findRelevantEval()" style="height: 100%" data-toggle='modal' data-target='#evaluationInfo' :data-user="application.id">
        <div class='card-body notification-card-spacing mx-1'>
            <p class='card-text text-shadow'>
                <a @click.stop :href="'https://osu.ppy.sh/users/' + application.applicant.osuId" target="_blank">{{application.applicant.username}}</a> 
                <i v-if="application.mode == 'osu'" class="far fa-circle"></i>
                <i v-else-if="application.mode == 'taiko'" class="fas fa-drum"></i>
                <i v-else-if="application.mode == 'catch'" class="fas fa-apple-alt"></i>
                <i v-else-if="application.mode == 'mania'" class="fas fa-stream"></i>
            </p>
        </div>
        <div class="card-footer notification-card-spacing mx-2 small">
            <p class='card-text text-shadow'>
                Deadline: <span class="errors">{{createDeadline(application.createdAt)}}</span>
            </p>
            
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'eval-card',
    props: ['application', 'evalRound', 'evaluator'],
    methods: {
        selectApplication: function () {
            this.$emit('update:selectedApplication', this.application);
        },
        findRelevantEval: function(){
            let vote;
            this.application.evaluations.forEach(ev => {
                if(ev.evaluator == this.evaluator){
                    if(ev.vote == 1){
                        vote = 'pass';
                    }else if(ev.vote == 2){
                        vote = 'neutral'
                    }else{
                        vote = 'fail'
                    }
                }
            });
            return vote;
        },
        createDeadline: function(date){
            date = new Date(date);
            date = new Date(date.setDate (date.getDate() + 7)).toString().slice(4,10);
            return date;
        },
    },
}
</script>

<style>

</style>
