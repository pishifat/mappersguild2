<template>
    <div style="position: fixed; z-index: 2000; bottom: 20px; right: 20px;" class="bg-dark">
        <a href="/notifications">Notifications: <span class="badge badge-light">{{ notifications }}</span>
        Invites: {{ invites }}</a>
        <a href="#navbar" class="fas fa-angle-up fa-lg"></a>
    </div>
</template>

<script>
export default {
    data () {
        return {
            notifications: 1,
            invites: 1,
        }
    },
    mounted () {
        axios
      		.get('/notifications/relevantInfo')
      		.then(response => {
                this.notifications = response.data.notifications.length;
                this.invites = response.data.invites.length;
            });
    }
}
</script>

<style>

</style>
