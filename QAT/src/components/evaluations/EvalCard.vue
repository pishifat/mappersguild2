<template>
<div class='col-md-2 my-2' @click="selectApplicant()" >
    <div class="card custom-bg-dark border-outline" style="height: 100%" data-toggle='modal' data-target='#evaluationInfo' :data-user="applicant.id">
        <div class='card-body notification-card-spacing mx-1'>
            <p class='card-text text-shadow'>
                <a @click.stop :href="'https://osu.ppy.sh/users/' + applicant.osuId" target="_blank">{{applicant.username}}</a> 
                <i v-if="applicant.mode == 'osu'" class="far fa-circle"></i>
                <i v-else-if="applicant.mode == 'taiko'" class="fas fa-drum"></i>
                <i v-else-if="applicant.mode == 'catch'" class="fas fa-apple-alt"></i>
                <i v-else-if="applicant.mode == 'mania'" class="fas fa-stream"></i>
            </p>
        </div>
        <div class="card-footer notification-card-spacing mx-2 small">
            <p class='card-text text-shadow'>
                Deadline: <span class="errors">{{createDeadline(applicant.createdAt)}}</span>
            </p>
            
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'eval-card',
    props: ['applicant'],
    methods: {
        selectApplicant: function () {
            this.$emit('update:selectedApplicant', this.applicant);
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
