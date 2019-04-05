<template>
<div class='col-md-12 my-2'>
    <div class="card custom-bg-dark border-outline" style="height: 100%">
        <div class='card-body notification-card-spacing'>
            <p class='card-text text-shadow small'>
                {{applicant.username}}
            </p>
        </div>
        <div class="card-footer notification-card-spacing mx-2">
            
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'eval-card',
    props: ['applicant'],
    methods: {
        
    },
}
</script>

<style>

</style>
