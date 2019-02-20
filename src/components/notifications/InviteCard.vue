<template>

<div class='col-md-12 my-2'>
    <div class="card custom-bg-dark border-rank-done" style="height: 100%">
        <div class='card-body notification-card-spacing'>
            <p class='card-text text-shadow small'>
                <a :href="'https://osu.ppy.sh/users/' + invite.sender.osuId" class="text-shadow" target="_blank" @click.stop>{{invite.sender.username}}</a> 
                {{invite.info}}
                <span v-if="invite.map">
                    <span v-if="invite.map.url"><a  :href="invite.map.url" target="_blank">{{invite.map.song.artist}} - {{invite.map.song.title}}</a></span>
                    <span v-else>{{invite.map.song.artist}} - {{invite.map.song.title}}</span>
                    <a href="#" class="icon-valid" @click.prevent="selectBeatmap()" :data-user="invite.map.id" data-toggle="modal" data-target="#limitedEditBeatmap"><i class="far fa-window-maximize"></i></a>
                </span>
            </p>
        </div>
        <div class="card-footer notification-card-spacing mx-2">
            <span class='card-text text-shadow small'>{{invite.createdAt.slice(0,10)}}</span> <span class="errors small text-shadow">{{info}}</span>
            <button class="btn btn-mg-used notification-button float-right mx-1" @click.prevent="hideInvite($event)">Decline</button>
            <button class="btn btn-mg notification-button float-right mx-1" @click.prevent="acceptInvite(invite.actionType, $event)">Accept</button>
        </div>
    </div>
</div>

</template>

<script>
export default {
    name: 'invite-card',
    props: ['invite'],
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
        selectBeatmap: function (e) {
            this.$emit('update:selectedMap', this.invite.map);
        },
        hideInvite: function (e) {
            this.$emit('hide-invite', {id: this.invite.id, e: e});
        },
        acceptInvite: async function(actionType, e){
            let invite;
            if(actionType == "collab"){
                invite = await this.executePost('/notifications/acceptCollab/' + this.invite.id, {}, e);
            }else if(actionType == "task"){
                invite = await this.executePost('/notifications/acceptDiff/' + this.invite.id, {}, e);
            }else if(actionType == "host"){
                invite = await this.executePost('/notifications/acceptHost/' + this.invite.id, {}, e);
            }else if(actionType == "join"){
                invite = await this.executePost('/notifications/acceptJoin/' + this.invite.id, {}, e);
            }
            if(invite){
                this.$emit('hide-accepted-invite', {id: this.invite.id, e: e});
            }
        },
    },
    data() {
        return{
            info: ''
        }
    }
}
</script>

<style>

</style>
