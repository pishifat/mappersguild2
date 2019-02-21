<template>
<div id="limitedEditParty" class="modal fade" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content custom-bg-dark" v-if="party">
            <div class="modal-header modal-header-card text-dark" :class="'bg-rank-' + party.rank">
                <h5 class="modal-title modal-title-card">{{ party.name }}</h5>
                <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
                </button>
            </div>
            <div class="modal-body modal-body-card" style="overflow: hidden;">
                <img src="../images/the_A.png" class="the-a-background">
                <p class="text-shadow">Members: (<span :class="party.id + '-member-count'">{{ party.members.length }}</span>)</p> 
                <p class="indent text-shadow">
                    <template v-for="(member, i) in party.members"><a :key="i" :href="'https://osu.ppy.sh/users/' + member.osuId" target="_blank">{{ member.username + (i < party.members.length - 1 ? ', ' : '') }}</a></template>
                </p>
                <p class="text-shadow">Leader: <a :href="'https://osu.ppy.sh/users/' + party.leader.osuId" target="_blank">{{ party.leader.username }}</a></p>
                <p class="text-shadow">Rank: {{ party.rank }}</p>
                <p class="text-shadow">
                    Current Quest: <span :class="party.id + '-quest'">{{ party.currentQuest ? party.currentQuest.name : 'none' }}</span>
                </p>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import mixin from "../mixins.js";

export default {
    name: 'limited-party-info',
    props: [ 'party' ],
    mixins: [ mixin ],
}
</script>

<style>

</style>
