<template>
<div class='col-md-12 my-2'>
    <div class="card custom-bg-dark border-rank-done" style="height: 100%">
        <div class='card-body notification-card-spacing'>
            <p class='card-text text-shadow small'>
                <a :href="'https://osu.ppy.sh/users/' + notification.sender.osuId" class="text-shadow" target="_blank" @click.stop>{{notification.sender.username}}</a> 
                {{notification.info}}
                <span v-if="notification.map">
                    <span v-if="notification.map.url"><a  :href="notification.map.url" target="_blank">{{notification.map.song.artist}} - {{notification.map.song.title}}</a> [also show card]</span>
                    <span v-else>{{notification.map.song.artist}} - {{notification.map.song.title}} [also show card]</span>
                </span>
            </p>
        </div>
        <div class="card-footer notification-card-spacing mx-2">
            <span class='card-text text-shadow small'>{{notification.createdAt.slice(0,10)}}</span>
            <button class="btn btn-mg notification-button float-right" @click.prevent="hideNotification($event)">Mark as read</button>
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'notification-card',
    props: ['notification'],
    methods: {
        hideNotification: function (e) {
            this.$emit('hide-notification', {notification: this.notification, e: e});
        },
    },
}
</script>

<style>

</style>
