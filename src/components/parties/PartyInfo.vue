<template>
<div id="extendedInfo" class="modal fade" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content custom-bg-dark" v-if="party">
            <div class="modal-header modal-header-card text-dark" :class="'bg-rank-' + party.rank">
                <h5 class="modal-title modal-title-card">{{ party.name }}</h5>
                <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
                </button>
            </div>
            <div class="modal-body modal-body-card" style="overflow: hidden;">
                <img src="../../images/the_A.png" class="the-a-background">
                <p class="text-shadow">Members: (<span :class="party.id + '-member-count'">{{ party.members.length }}</span>)</p> 
                <p class="indent text-shadow">
                    <template v-for="(member, i) in party.members"><a :key="i" :href="'https://osu.ppy.sh/users/' + member.osuId" target="_blank">{{ member.username + (i < party.members.length - 1 ? ', ' : '') }}</a></template>
                </p>
                <p class="text-shadow">Leader: <a :href="'https://osu.ppy.sh/users/' + party.leader.osuId" target="_blank">{{ party.leader.username }}</a></p>
                <p class="text-shadow">Rank: {{ party.rank }}</p>
                <p class="text-shadow">
                    Current Quest: <span :class="party.id + '-quest'">{{ party.currentQuest ? party.currentQuest.name : 'none' }}</span>
                </p>

                <!-- leader options -->
                <div v-if="userId == party.leader.osuId">
                    <hr>
                    <p class="text-shadow">Party leader options:</p>
                    <div class="input-group input-group-sm mb-3">
                        <input class="form-control form-control-sm" type="text" placeholder="New name..." id="newName" maxlength="32"
                            style="filter: drop-shadow(1px 1px 1px #000000); border-radius: 100px 0 0 100px;" 
                            @keyup.enter="rename($event)" />
                        <div class="input-group-prepend">
                            <button style="border-radius: 0 100px 100px 0;" class="btn btn-mg rename-button" @click="rename($event)" type="submit"><span class="append-button-padding">Save new name</span></button>
                        </div>
                    </div>
                    <div class="input-group input-group-sm mb-3">
                        <input class="form-control form-control-sm" type="text" placeholder="Beatmap set ID (banner = map bg)" id="banner" 
                            style="filter: drop-shadow(1px 1px 1px #000000); border-radius: 100px 0 0 100px" 
                            @keyup.enter="addBanner($event)" />
                        <div class="input-group-append">
                            <button style="border-radius: 0 100px 100px 0;" class="btn btn-mg banner-button" @click="addBanner($event)" type="submit"><span class="append-button-padding">Save banner</span></button>
                        </div>
                    </div>

                    <div v-if="party.members.length > 1">
                        <div class="input-group input-group-sm mb-3 kick-member-input">
                            <select class="custom-select select-arrow small" id="kick">
                                <option selected value="none">Select a user...</option>
                                <template v-for="member in party.members">
                                    <option :key="member.id" :value="member.id" v-if="member.osuId !== userId">{{member.username}}</option>
                                </template>
                            </select>
                            <div class="input-group-append">
                                <button style="border-radius: 0 100px 100px 0;" class="btn btn-mg-used kick-button" @click="kickMember($event)"><span class="append-button-padding">Kick</span></button>
                            </div>
                        </div>
                        <div class="input-group input-group-sm mb-3 transfer-leader-input">
                            <select class="custom-select select-arrow small" id="transfer">
                                <option selected value="none">Select a user...</option>
                                <template v-for="member in party.members">
                                    <option :key="member.id" :value="member.id" v-if="member.osuId !== userId">{{member.username}}</option>
                                </template>
                            </select>
                            <div class="input-group-append">
                                <button style="border-radius: 0 100px 100px 0;" class="btn btn-mg transfer-leader-button" @click="transferLeader($event)"><span class="append-button-padding">Transfer Leader</span></button>
                            </div>
                        </div>
                    </div>

                    <button 
                        class="btn btn-sm justify-content-center" 
                        :class="{ 'btn-mg': party.lock, 'btn-mg-used': !party.lock }" 
                        @click="switchLock($event)"
                    >
                        {{party.lock ? 'Allow new members' : 'Disallow new members'}}
                    </button>
                </div>
                <!-- end leader options -->

                <hr>
                <div v-if="!(!userPartyId && !party.lock && !party.currentQuest && party.members.length <= 12) && userPartyId != party.id">
                    <p class="small text-shadow">You're unable to join this party because:</p>
                    <ul style="list-style-type: none" class="small text-shadow">
                        <li v-if="userPartyId">You can only be in one party at a time</li>
                        <li v-if="party.lock">The party's leader has disabled new member entry</li>
                        <li v-if="party.currentQuest">The party is currently running a quest</li>
                        <li v-if="party.members.length > 12">The party has the maximum number of members (12)</li>
                    </ul>
                </div>

                <div v-if="!userPartyId && !party.lock && !party.currentQuest && party.members.length < 12">
                    <button class='btn btn-mg btn-sm justify-content-center float-right join' @click="joinParty(party.id)">Join party</button>
                </div>
                <div v-if="userId == party.leader.osuId && party.members.length > 1">
                    <button class='btn btn-mg-used btn-sm justify-content-center float-right' @click="leaveParty(party.id)" disabled>Leave party</button>
                </div>
                <div v-if="userPartyId == party.id && party.members.length > 1 && userId != party.leader.osuId">
                    <button class='btn btn-mg-used btn-sm justify-content-center float-right' @click="leaveParty(party.id, $event)">Leave party</button>
                </div>
                <div v-if="userPartyId === party.id && party.members.length == 1">
                    <button class='btn btn-mg-used btn-sm justify-content-center float-right' @click="deleteParty($event)">Disband party</button>
                </div>

                <p class="mt-4 text-shadow">{{ info }}</p>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import mixin from "../../mixins.js";

export default {
    name: 'party-info',
    props: [ 'party', 'userId', 'userPartyId' ],
    mixins: [ mixin ],
    methods: {
        acceptQuest: function (e) {
            this.$emit('accept-quest', {id: this.quest.id, e: e});
        },
        dropQuest: function (e) {
            this.$emit('drop-quest', {id: this.quest.id, e: e});
        }, 
    },
    data() {
        return {
            info: ''
        }
    }
}
</script>

<style>

</style>
