<template>

<div class='col-md-4 col-lg-3 my-2' @click="selectUser()">
    <div class="card custom-bg-dark border-outline" :class="'border-rank-' + user.rank" style="height: 100%"
        data-toggle="modal" data-target='#extendedInfo' :data-user="user.osuId">
        <div class='card-header'><a :href="'https://osu.ppy.sh/users/' + user.osuId"
                class="text-shadow" target="_blank" @click.stop>{{user.username}}</a> <span class="pseudo-float-right-avatar"><img
                    :src="'https://a.ppy.sh/' + user.osuId"
                    class="rounded-circle avatar-mini-thumb"></span></div>
        <div class='card-body'>
            <p class='card-text text-shadow'>Total points: {{user.totalPoints}}</p>
            <p class='card-text text-shadow'>Party:
                <span>{{user.currentParty ? user.currentParty.name : 'none'}}</span>
            </p>
        </div>
    </div>
</div>

</template>

<script>
export default {
    name: 'user-card',
    props: ['user'],
    methods: {
        selectUser: function () {
            this.$emit('update:selectedUser', this.user)
        },
    }
}
</script>

<style>
    .avatar-mini-thumb{
        height:64px;
        width:64px;
        object-fit:cover;
        filter: drop-shadow(1px 1px 1px #000000);
    }

    .pseudo-float-right-avatar{
        position:absolute;
        top:1rem;
        right:1rem;
    }

</style>
