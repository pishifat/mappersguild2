<template>
<div class='col-md-12 my-2'>
    <div class="card bg-dark">
        <div class='card-body notification-card-spacing'>
            <p class='card-text text-shadow small'>
                <a :href="'https://osu.ppy.sh/users/' + notification.sender.osuId" class="text-shadow" target="_blank" @click.stop>{{notification.sender.username}}</a> 
                {{notification.info}}
                <span v-if="notification.map">
                    <span v-if="notification.map.url"><a  :href="notification.map.url" target="_blank">"{{notification.map.song.artist}} - {{notification.map.song.title}}"</a></span>
                    <span v-else>"{{notification.map.song.artist}} - {{notification.map.song.title}}"</span>
                    <a href="#" class="icon-valid" @click.prevent="selectBeatmap()" :data-user="notification.map.id" data-toggle="modal" data-target="#limitedEditBeatmap"><i class="far fa-window-maximize"></i></a>
                </span>
                <span v-if="notification.party">"{{notification.party.name}}" <a href="#" class="icon-valid" @click.prevent="selectParty()" :data-user="notification.party.id" data-toggle="modal" data-target="#limitedEditParty"><i class="far fa-window-maximize"></i></a></span>
            </p>
        </div>
        <div class="card-footer notification-card-spacing mx-2">
            <span class='card-text text-shadow small'>{{notification.createdAt.slice(0,10)}}</span>
            <button class="btn btn-outline-info notification-button float-right" @click.prevent="hideNotification($event)">Mark as read</button>
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
            this.$emit('hide-notification', {id: this.notification.id, e: e});
        },
        selectBeatmap: function (e) {
            this.$emit('update:selectedMap', this.notification.map);
        },
        selectParty: function (e) {
            this.$emit('update:selectedParty', this.notification.party);
        },
    },
}
</script>

<style>

</style>
