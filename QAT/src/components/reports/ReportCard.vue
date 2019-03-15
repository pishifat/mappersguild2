<template>

<div class='col-md-4 col-lg-3 my-2' @click="selectReport()">
    <div class="card custom-bg-dark border-outline" 
        :class="report.valid == 1 ? 'border-pass' : report.valid == 2 ? 'border-extend' : report.valid == 3 ? 'border-fail' : ''"
        style="height: 100%" data-toggle="modal" data-target='#reportInfo' :data-user="report.id">   
        <div class='card-body qat-user-card-spacing'>
            <a :href="'https://osu.ppy.sh/users/' + report.culprit.osuId"
                class="text-shadow" target="_blank" @click.stop>{{report.culprit.username}}</a> 
            <span class="pseudo-float-right-avatar">
                <img :src="'https://a.ppy.sh/' + report.culprit.osuId" class="rounded-circle avatar-mini-thumb">
            </span>
            <p class="small ml-1 text-shadow">Reported: {{report.createdAt.slice(0,10)}}</p>
        </div>
    </div>
</div>

</template>

<script>
export default {
    name: 'report-card',
    props: ['report'],
    methods: {
        selectReport: function () {
            this.$emit('update:selectedReport', this.report)
        },
    }
}
</script>

<style>
    .avatar-mini-thumb{
        height:40px;
        width:40px;
        object-fit:cover;
        filter: drop-shadow(1px 1px 1px #000000);
    }

    .pseudo-float-right-avatar{
        position:absolute;
        top:0.5rem;
        right:0.75rem;
    }

    .qat-user-card-spacing{
        margin: 0;
        padding: 0.5rem 0.5rem 0.5rem 0.5rem;
    }

</style>
