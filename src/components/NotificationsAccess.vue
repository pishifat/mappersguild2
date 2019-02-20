<template>
    <div class="bg-dark pl-3"  style="
        position: fixed; 
        z-index: 1060; 
        bottom: 20px; 
        right: 20px;
        border-radius: 100px;
    " >
        <a href="/notifications"><span class="badge badge-light" data-toggle="tooltip" data-placement="top" title="notifications">{{ notifications }}</span>
        <span class="badge badge-light" data-toggle="tooltip" data-placement="top" title="invites">{{ invites }}</span></a>
        <a href="#navbar" class="btn btn-secondary fas fa-angle-up fa-2x ml-2" style="
            background-color: var(--done);
            border-color: var(--done);
            filter: drop-shadow(1px 1px 1px #000000);
            border-radius: 10000px;
        "></a>
    </div>
</template>

<script>
export default {
    data () {
        return {
            notifications: null,
            invites: null,
        }
    },
    created () {
        axios
      		.get('/notifications/relevantInfo')
      		.then(response => {
                this.notifications = response.data.notifications.length;
                this.invites = response.data.invites.length;
            });
    },
    mounted () {
        setInterval(() => {
            axios
                .get('/notifications/relevantInfo')
                .then(response => {
                    this.notifications = response.data.notifications.length;
                    this.invites = response.data.invites.length;
                });
        }, 30000);
    }
}
</script>

<style>

</style>
