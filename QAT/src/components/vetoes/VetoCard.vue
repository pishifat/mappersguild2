<template>

<div class='col-md-4 col-lg-3 my-2' @click="selectVeto()">
    <div class="card custom-bg-dark border-outline" style="height: 100%"
        data-toggle="modal" data-target='#extendedInfo' :data-veto="veto.id">
                
        <div class='card-body'>
            <p class="text-shadow">
                `Beatmap name here`
                <i v-if="veto.mode.indexOf('osu') >= 0" class="far fa-circle"></i>
                <i v-if="veto.mode.indexOf('taiko') >= 0" class="fas fa-drum"></i>
                <i v-if="veto.mode.indexOf('catch') >= 0" class="fas fa-apple-alt"></i>
                <i v-if="veto.mode.indexOf('mania') >= 0" class="fas fa-stream"></i>
            </p>
            <p class="text-shadow">Created: {{veto.createdAt.slice(0,10)}}</p>
        </div>
    </div>
</div>

</template>

<script>
export default {
    name: 'veto-card',
    props: ['veto', 'user-id'],
    methods: {
        selectVeto: function () {
            this.$emit('update:selectedVeto', this.veto);
        },
    }
}
</script>

<style>

</style>
