<template>
<div class="col-md-6 my-2" :class="party.id + '-card'" @click="extendedInfo(party)">
    <div class="card custom-bg-dark party-card" :class="'border-rank-' + party.rank" :data-user="party.id" data-toggle="modal" data-target="#extendedInfo">
        <img :class="party.id + '-card-image'" :src="party.art ? 'https://assets.ppy.sh/beatmaps/' + party.art + '/covers/cover.jpg' : 'https://osu.ppy.sh/images/layout/beatmaps/default-bg.png'" style="right:250px;"> 
        <div class='card-img-overlay' style='padding: 0'>
            <div class="card-header text-shadow">
                <big :class="party.id + '-name'">{{party.name}}</big>
                <span v-if="userPartyId == party.id">
                    <button v-if="userId == party.leader.osuId && party.members.length == 1" class='btn btn-mg-used btn-sm justify-content-center float-right dynamic-membership' @click.stop="deleteParty($event)">Disband party</button>
                    <button v-else-if="userId == party.leader.osuId && party.members.length > 1" class='btn btn-mg-used btn-sm justify-content-center float-right dynamic-membership' @click.stop="leaveParty(party.id)" disabled>Leave party</button>
                    <button v-else class='btn btn-mg-used btn-sm justify-content-center float-right dynamic-membership' @click.stop="leaveParty(party.id, $event)">Leave party</button>
                </span>
                <span v-else-if="!userPartyId && !party.lock && !party.currentQuest && party.members.length < 12">
                    <button class='btn btn-mg btn-sm justify-content-center float-right join' @click.stop="joinParty(party.id)">Join party</button>
                </span>
            </div>
            <div class="card-body overwrite-card-spacing">
                <p class="card-text text-shadow">Members: ({{party.members.length}})</p>
                <p class="small indent text-shadow">
                    <template v-for="(member, i) in party.members"><a :href="'https://osu.ppy.sh/users/' + member.osuId" target="_blank">{{ member.username + (i < party.members.length - 1 ? ', ' : '') }}</a></template>
                </p>
                <p class="card-text text-shadow" style='margin-top:0.5rem'>Leader: <a :href="'https://osu.ppy.sh/users/' + party.leader.osuId" target="_blank">{{party.leader.username}}</a></p>
                <p class="card-text text-shadow">Current Quest: 
                    <span class="party.id + '-quest'">
                        {{ party.currentQuest ? party.currentQuest.name : 'none' }}
                    </span>
                </p>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {

}
</script>

<style>

</style>
