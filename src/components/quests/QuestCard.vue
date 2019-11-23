<template>
<div class="col-sm-12 my-1">
    <div class="card static-card" :class="quest.minRank ? 'rank-restricted' : quest.status == 'wip' && timeRemaining(quest.deadline) < 0 ? 'overdue' : 'bg-dark'">
        <div class="text-shadow min-spacing">
            <div class="min-spacing mt-1 row">
                <span class="col-sm-5">
                    <span v-if="quest.art">
                        <a :href="'https://osu.ppy.sh/beatmaps/artists/' + quest.art" target="_blank">
                            <img :src="'https://assets.ppy.sh/artists/' + quest.art + '/cover.jpg'" class="card-avatar-img">
                        </a>
                    </span>
                    <span v-else>
                        <img :src="'../../images/no-art-icon.png'" class="card-avatar-img">
                    </span>
                    <a :href="'#details' + quest.id" data-toggle="collapse" class="ml-1">
                        {{quest.name.length > 40 ? quest.name.slice(0,40) + "..." : quest.name}}
                        <i class="fas fa-angle-down" />
                    </a>
                </span>
                <span class="small min-spacing col-sm-3 mt-1">
                    Party size: 
                    <span 
                        data-toggle="tooltip"
                        data-placement="top"
                        :title="
                            quest.minParty == quest.maxParty ? quest.minParty + ' users' :
                            quest.status == 'open' ? quest.minParty + '-' + quest.maxParty + ' users' : 
                            quest.status == 'wip' ? quest.currentParty.members.length + ' users' : 
                            quest.status == 'done' ? quest.completedMembers.length + ' users' : ''"
                    >   
                        <span v-if="quest.status == 'open'">
                            <i v-for="i in quest.minParty" :key="i" class="fas fa-user"></i><i v-for="i in quest.maxParty - quest.minParty" :key="i+100" class="fas text-white-50 fa-user"></i>
                        </span>
                        <span v-else-if="quest.status == 'wip'">
                            <i v-for="member in quest.currentParty.members" :key="member.id" class="fas fa-user"></i>
                        </span>
                        <span v-else-if="quest.status == 'done'">
                            <i v-for="member in quest.completedMembers" :key="member.id" class="fas fa-user"></i>
                        </span>
                    </span>
                </span>
                <span class="small min-spacing col-sm-1 mt-1">
                    Reward:
                    <span 
                        class="text-white-50"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="flat points bonus per user, additional ~2 points per difficulty"
                    >{{quest.reward}}pt{{quest.reward > 1 ? 's' : ''}}
                    </span>
                </span>
                <span class="small min-spacing col-sm-1 mt-1">
                    Time: 
                    <span class="text-white-50">{{Math.round(quest.timeframe / (1000*60*60*24))}} days</span>
                </span>
                <span class="small min-spacing col-sm-2 mt-1">
                    Modes: 
                    <i v-if="quest.modes.includes('osu')" class="fas fa-circle" data-toggle="tooltip" data-placement="top" title="osu!"></i>
                    <i v-if="quest.modes.includes('taiko')" class="fas fa-drum" data-toggle="tooltip" data-placement="top" title="osu!taiko"></i>
                    <i v-if="quest.modes.includes('catch')" class="fas fa-apple-alt" data-toggle="tooltip" data-placement="top" title="osu!catch"></i>
                    <i v-if="quest.modes.includes('mania')" class="fas fa-stream" data-toggle="tooltip" data-placement="top" title="osu!mania"></i>
                </span>
            </div>
        </div>
        <div class="card-header min-spacing pb-1 pl-2">
            <span class="small text-shadow">Objective:</span>
            <span class="small text-shadow text-white-50">{{quest.descriptionMain}}</span>
        </div>
        <!--collapsed info-->
        <div :id="'details' + quest.id" class="collapse ml-4 my-2 row bg-darker">   
            <!--open quests-->
            <div v-if="quest.status == 'open'" class="col-sm-12">
                <p class="sub-header text-shadow min-spacing">
                    <button v-if="notInParty()" class="btn btn-sm btn-outline-info mb-2" @click.prevent="createParty($event)">Add party <i class="fas fa-plus small"></i></button>
                </p>
                <div v-for="party in quest.parties" :key="party.id">
                    <div class="row">
                        <p class="sub-header col-sm-4 text-shadow min-spacing">
                            <u><a :href="'https://osu.ppy.sh/users/' + party.leader.osuId" target="_blank">{{party.leader.username}}</a>'s party</u>
                            ({{party.members.length}})
                            <i v-if="party.lock" class="fas fa-lock small" data-toggle="tooltip" data-placement="top" title="party is invite-only"></i>
                            <i v-else class="fas fa-unlock small" data-toggle="tooltip" data-placement="top" title="party is open"></i>
                            <i 
                                v-if="party.rank > 0" 
                                class="fas fa-crown" 
                                :class="party.rank == 1 ? 'text-rank-1' : party.rank == 2 ? 'text-rank-2' : 'text-rank-3'"
                                data-toggle="tooltip"
                                data-placement="top"
                                :title="party.rank == 1 ? 'rank 1 party' : party.rank == 2 ? 'rank 2 party' : 'rank 3 party'"
                                >
                            </i>
                            <button v-if="notInParty() && !party.lock" class="btn btn-sm btn-outline-info" @click.prevent="joinParty(party.id, $event)">Join <i class="fas fa-plus small"></i></button>
                            <button v-if="inCurrentParty(party.members) && !party.lock && userId != party.leader.id" class="btn btn-sm btn-outline-danger" @click.prevent="leaveParty(party.id, $event)">Leave <i class="fas fa-minus small"></i></button>
                            <button v-if="party.leader.id == userId" class="btn btn-sm btn-outline-danger mx-2" @click.prevent="deleteParty(party.id, $event)">Delete <i class="fas fa-minus small"></i></button>
                        </p>
                        <div v-if="party.leader.id == userId" class="col-sm-2 mx-2 min-spacing input-group input-group-sm">
                            <input
                                class="form-control form-control-sm"
                                type="text"
                                placeholder="username..."
                                maxlength="18"
                                v-model="inviteUsername"
                                @keyup.enter="inviteToParty(party.id, $event)"
                            />
                            <span class="input-group-append">
                                <button
                                    class="btn btn-outline-info"
                                    @click="inviteToParty(party.id, $event)"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title="invite user to party"
                                >
                                    Invite
                                </button>
                            </span>
                        </div>
                        <div v-if="party.leader.id == userId" class="col-sm-3 mx-2 min-spacing input-group input-group-sm">
                            <select class="form-control form-control-sm" v-model="dropdownUserId">
                                <template v-for="member in party.members">
                                    <option
                                        :key="member.id"
                                        :value="member.id"
                                        v-if="member.id !== userId"
                                        >{{ member.username }}</option
                                    >
                                </template>
                            </select>
                            <div class="input-group-append">
                                <button
                                    class="btn btn-outline-info"
                                    @click="transferPartyLeader(party.id, $event)"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title="change party leader"
                                >
                                    Lead
                                </button>
                            </div>
                            <div class="input-group-append">
                                <button
                                    class="btn btn-outline-info"
                                    @click="kickPartyMember(party.id, $event)"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title="kick party member"
                                >
                                    Kick
                                </button>
                            </div>
                        </div>
                        <div v-if="party.leader.id == userId" class="col-sm-2">
                            <button v-if="!party.lock" class="btn btn-sm btn-outline-info mx-2" @click.prevent="togglePartyLock(party.id, party.lock, $event)">Lock <i class="fas fa-lock small"></i></button>
                            <button v-else class="btn btn-sm btn-outline-info mx-2" @click.prevent="togglePartyLock(party.id, party.lock, $event)">Unlock <i class="fas fa-unlock"></i></button>
                        </div>
                    </div>
                    <p class='small text-shadow min-spacing ml-3'>
                        Members: 
                    </p>
                    <ul class="min-spacing ml-4">
                        <li class="text-shadow small" v-for="member in party.members" :key="member.id">
                            <a :href="'https://osu.ppy.sh/users/' + member.osuId" target="_blank">
                                {{ member.username }}
                            </a>
                            <i 
                                v-if="member.rank > 0"
                                class="fas fa-crown" 
                                :class="member.rank == 1 ? 'text-rank-1' : member.rank == 2 ? 'text-rank-2' : 'text-rank-3'"
                                data-toggle="tooltip"
                                data-placement="top"
                                :title="member.rank == 1 ? 'rank 1 user' : member.rank == 2 ? 'rank 2 user' : 'rank 3 user'"
                                >
                            </i>
                        </li>
                    </ul>
                    <p class='small text-shadow min-spacing ml-3 mt-1'>
                        Modes: 
                        <span v-if="party.leader.id == userId">
                            <a href="#" @click.prevent="togglePartyMode(party.id, 'osu')">
                                <i class="fas fa-circle" :class="party.modes.includes('osu') ? '' : 'text-white-50'" data-toggle="tooltip" data-placement="top" title="toggle osu!"></i>
                            </a>
                            <a href="#" @click.prevent="togglePartyMode(party.id, 'taiko')">
                                <i class="fas fa-drum" :class="party.modes.includes('taiko') ? '' : 'text-white-50'" data-toggle="tooltip" data-placement="top" title="toggle osu!taiko"></i>
                            </a>
                            <a href="#" @click.prevent="togglePartyMode(party.id, 'catch')">
                                <i class="fas fa-apple-alt" :class="party.modes.includes('catch') ? '' : 'text-white-50'" data-toggle="tooltip" data-placement="top" title="toggle osu!catch"></i>
                            </a>
                            <a href="#" @click.prevent="togglePartyMode(party.id, 'mania')">
                                <i class="fas fa-stream" :class="party.modes.includes('mania') ? '' : 'text-white-50'" data-toggle="tooltip" data-placement="top" title="toggle osu!mania"></i>
                            </a>
                        </span>
                        <span v-else>
                            <i v-if="party.modes.includes('osu')" class="fas fa-circle" data-toggle="tooltip" data-placement="top" title="osu!"></i>
                            <i v-if="party.modes.includes('taiko')" class="fas fa-drum" data-toggle="tooltip" data-placement="top" title="osu!taiko"></i>
                            <i v-if="party.modes.includes('catch')" class="fas fa-apple-alt" data-toggle="tooltip" data-placement="top" title="osu!catch"></i>
                            <i v-if="party.modes.includes('mania')" class="fas fa-stream" data-toggle="tooltip" data-placement="top" title="osu!mania"></i>
                        </span>
                    </p>
                    <button 
                        v-if="party.leader.id == userId && party.rank >= quest.minRank && party.members.length >= quest.minParty && party.members.length <= quest.maxParty" 
                        class="btn btn-sm btn-outline-success mx-2 my-2" 
                        @click.prevent="acceptQuest(party.id, party.modes, $event)"
                    >
                        Accept quest
                        <i class="fas fa-check small"></i>
                    </button>   
                </div>
           </div>

            <!--wip quests-->
            <div v-if="quest.status == 'wip'" class="col-sm-6">
                <p class="sub-header text-shadow min-spacing">
                    <u><a :href="'https://osu.ppy.sh/users/' + quest.currentParty.leader.osuId" target="+blank">
                        {{quest.currentParty.leader.username}}
                    </a>'s party</u>
                    ({{quest.currentParty.members.length}})
                    <i 
                        v-if="quest.currentParty.rank > 0" 
                        class="fas fa-crown" 
                        :class="quest.currentParty.rank == 1 ? 'text-rank-1' : quest.currentParty.rank == 2 ? 'text-rank-2' : 'text-rank-3'"
                        data-toggle="tooltip"
                        data-placement="top"
                        :title="quest.currentParty.rank == 1 ? 'rank 1 party' : quest.currentParty.rank == 2 ? 'rank 2 party' : 'rank 3 party'"
                        >
                    </i>
                    <button 
                        v-if="inCurrentParty(quest.currentParty.members) && userId != quest.currentParty.leader.id"
                        class="btn btn-sm btn-outline-danger"
                        @click.prevent="leaveParty(quest.currentParty.id, $event)"
                    >
                        Leave
                        <i class="fas fa-minus small"></i>
                    </button>
                </p>
                <p class='small text-shadow min-spacing ml-3'>
                    Deadline: 
                    <span class="text-white-50">{{quest.deadline.slice(0,10)}}</span>
                </p>
                <p class='small text-shadow min-spacing ml-3'>
                    Time remaining:
                    <span :class="timeRemaining(quest.deadline) > 0 ? 'text-white-50' : 'errors'">{{timeRemaining(quest.deadline)}} days</span>
                </p>
                <p class='small text-shadow min-spacing ml-3'>
                    Members: 
                </p>
                <ul class="min-spacing ml-4">
                    <li class="text-shadow small" v-for="member in quest.currentParty.members" :key="member.id">
                        <a :href="'https://osu.ppy.sh/users/' + member.osuId" target="_blank">
                            {{ member.username }}
                        </a>
                        <i 
                            v-if="member.rank > 0"
                            class="fas fa-crown" 
                            :class="member.rank == 1 ? 'text-rank-1' : member.rank == 2 ? 'text-rank-2' : 'text-rank-3'"
                            data-toggle="tooltip"
                            data-placement="top"
                            :title="member.rank == 1 ? 'rank 1 user' : member.rank == 2 ? 'rank 2 user' : 'rank 3 user'"
                            >
                        </i>
                    </li>
                </ul>
                <button 
                    v-if="quest.currentParty.leader.id == userId" 
                    class="btn btn-sm btn-outline-danger mx-2 my-2" 
                    @click.prevent="dropQuest(quest.currentParty.id, $event)"
                >
                    Drop quest
                    <i class="fas fa-times small"></i>
                </button>
                <div v-if="quest.currentParty.leader.id == userId" class="col-sm-6 mx-2 min-spacing input-group input-group-sm">
                    <input
                        class="form-control form-control-sm"
                        type="text"
                        placeholder="username..."
                        maxlength="18"
                        v-model="inviteUsername"
                        @keyup.enter="inviteToParty(quest.currentParty.id, $event)"
                    />
                    <span class="input-group-append">
                        <button
                            class="btn btn-outline-info"
                            @click="inviteToParty(quest.currentParty.id, $event)"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="invite user to party"
                        >
                            Invite
                        </button>
                    </span>
                </div>
                <div v-if="quest.currentParty.leader.id == userId" class="col-sm-6 mx-2 my-2 min-spacing input-group input-group-sm">
                    <select class="form-control form-control-sm" v-model="dropdownUserId">
                        <template v-for="member in quest.currentParty.members">
                            <option
                                :key="member.id"
                                :value="member.id"
                                v-if="member.id !== userId"
                                >{{ member.username }}</option
                            >
                        </template>
                    </select>
                    <div class="input-group-append">
                        <button
                            class="btn btn-outline-info"
                            @click="transferPartyLeader(quest.currentParty.id, $event)"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="change party leader"
                        >
                            Lead
                        </button>
                    </div>
                    <div class="input-group-append">
                        <button
                            class="btn btn-outline-info"
                            @click="kickPartyMember(quest.currentParty.id, $event)"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="kick party member"
                        >
                            Kick
                        </button>
                    </div>
                </div>
            </div>
                
            <!--done quests-->
            <div v-if="quest.status == 'done'" class="col-sm-6">
                <p class="sub-header text-shadow min-spacing"><u>Party</u></p>
                <p class='small text-shadow min-spacing ml-3'>
                    Completed: 
                    <span class="text-white-50">{{quest.completed.slice(0,10)}}</span>
                </p>
                <p class='small text-shadow min-spacing ml-3'>
                    Members: 
                </p>
                <ul class="min-spacing ml-4">
                    <li class="text-shadow small" v-for="member in quest.completedMembers" :key="member.id">
                        <a :href="'https://osu.ppy.sh/users/' + member.osuId" target="_blank">
                            {{ member.username }}
                        </a>
                        <i 
                            v-if="member.rank > 0"
                            class="fas fa-crown" 
                            :class="member.rank == 1 ? 'text-rank-1' : member.rank == 2 ? 'text-rank-2' : 'text-rank-3'"
                            data-toggle="tooltip"
                            data-placement="top"
                            :title="member.rank == 1 ? 'rank 1 user' : member.rank == 2 ? 'rank 2 user' : 'rank 3 user'"
                            >
                        </i>
                    </li>
                </ul>
            </div>
            <!--done or wip-->
            <div v-if="quest.status == 'done' || quest.status == 'wip'" class="col-sm-6">
                <p class="sub-header text-shadow min-spacing"><u>Associated maps</u></p>
                <ul v-if="quest.associatedMaps.length" class="min-spacing ml-3">
                    <li class="small text-shadow text-white-50" v-for="map in quest.associatedMaps" :key="map.id">
                        <template v-if="map.url">
                            <a :href="map.url" target="_blank">{{map.song.artist}} - {{map.song.title}}</a> by <a :href="'https://osu.ppy.sh/users/' + map.host.osuId" target="_blank">{{map.host.username}}</a>
                        </template>
                        <template v-else>
                            {{map.song.artist}} - {{map.song.title}} by <a :href="'https://osu.ppy.sh/users/' + map.host.osuId" target="_blank">{{map.host.username}}</a>
                        </template>
                    </li>
                </ul>
                <p v-else class="small text-shadow min-spacing text-white-50 ml-3">No associated maps...</p>
            </div>
            
            <div class="col-sm-12">
                <p class="small text-shadow min-spacing errors">{{ info }}</p>
                <p class="small text-shadow min-spacing confirm">{{ confirm }}</p>
            </div>
            
        </div>
    </div>
</div>


</template>

<script>
export default {
    name: 'quest-card',
    props: ['quest', 'userId'],
    methods: {
        executePost: async function(path, data, e) {
            if (e) e.target.disabled = true;
            if(this.info.length) this.info = '';
            if(this.confirm.length) this.confirm = '';

            try {
                const res = await axios.post(path, data);

                if (res.data.error) {
                    this.info = res.data.error;
                } else {
                    if (e) e.target.disabled = false;
                    return res.data;
                }
            } catch (error) {
                this.info = 'Something went wrong';
            }
            if (e) e.target.disabled = false;
        },
        //display
        timeRemaining: function(deadline) {
            let now = new Date().getTime();
            let distance = new Date(deadline).getTime() - now;
            return Math.floor(distance / (1000 * 60 * 60 * 24));
        },
        notInParty: function() {
            let valid = true;
            if(this.quest.parties.length){
                this.quest.parties.forEach(party => {
                    party.members.forEach(member => {
                        if(member.id == this.userId){
                            valid = false;
                        }
                    });
                });
            }
            return valid;
        },
        inCurrentParty: function(members) {
            let valid = false;
            members.forEach(member => {
                if(member.id == this.userId){
                    valid = true;
                }
            });
            return valid;
        },
        //functionality
        createParty: async function(e) {
            const quest = await this.executePost('/quests/createParty/' + this.quest.id, {}, e);
            if (quest) {
                this.$emit('update-quest', quest);
            }
        },
        deleteParty: async function(partyId, e) {
            var result = confirm(`Are you sure?`);
            if (result) {
                const quest = await this.executePost('/quests/deleteParty/' + partyId + '/' + this.quest.id, {}, e);
                if (quest) {
                    this.$emit('update-quest', quest);
                }
            }
        },
        togglePartyLock: async function(partyId, lock, e) {
            const quest = await this.executePost('/quests/togglePartyLock/' + partyId + '/' + this.quest.id, { lock }, e);
            if (quest) {
                this.$emit('update-quest', quest);
            }
        },
        togglePartyMode: async function(partyId, mode) {
            const quest = await this.executePost('/quests/togglePartyMode/' + partyId + '/' + this.quest.id, { mode });
            if (quest) {
                this.$emit('update-quest', quest);
            }
        },
        joinParty: async function(partyId, e) {
            const quest = await this.executePost('/quests/joinParty/' + partyId + '/' + this.quest.id, {}, e);
            if (quest) {
                this.$emit('update-quest', quest);
            }
        },
        leaveParty: async function(partyId, e) {
            var result = confirm(`Are you sure?`);
            if (result) {
                const quest = await this.executePost('/quests/leaveParty/' + partyId + '/' + this.quest.id, {}, e);
                if (quest) {
                    this.$emit('update-quest', quest);
                    if(quest.status == 'wip' && (quest.currentParty.members.length < quest.minParty || quest.currentParty.rank < quest.minRank)){
                        this.dropQuest(partyId, e);
                    }
                }
            }
        },
        inviteToParty: async function(partyId, e) {
            const success = await this.executePost('/quests/inviteToParty/' + partyId + '/' + this.quest.id, { username: this.inviteUsername }, e);
            if (success) {
                this.confirm = 'Invite sent!';
            }
        },
        transferPartyLeader: async function(partyId, e) {
            const quest = await this.executePost('/quests/transferPartyLeader/' + partyId + '/' + this.quest.id, { userId: this.dropdownUserId }, e);
            if (quest) {
                this.$emit('update-quest', quest);
            }
        },
        kickPartyMember: async function(partyId, e) {
            var result = confirm(`Are you sure?`);
            if (result) {
                const quest = await this.executePost('/quests/kickPartyMember/' + partyId + '/' + this.quest.id, { userId: this.dropdownUserId }, e);
                if (quest) {
                    this.$emit('update-quest', quest);
                    if(quest.status == 'wip' && (quest.currentParty.members.length < quest.minParty || quest.currentParty.rank < quest.minRank)){
                        this.dropQuest(partyId, e);
                    }
                }
            }
        },
        acceptQuest: async function(partyId, modes, e) {
            let modesText = '';
            for (let i = 0; i < modes.length; i++) {
                modesText += modes[i];
                if(i < modes.length-1){
                    modesText += ', ';
                }
            }
            var result = confirm(`Are you sure? This quest will only allow beatmaps of these modes: ${modesText}`);
            if (result) {
                const quests = await this.executePost('/quests/acceptQuest/' + partyId + '/' + this.quest.id, {}, e);
                if (quests) {
                    this.$emit('update-quests-by-name', quests);
                }
            }
        },
        dropQuest: async function(partyId, e) {
            const quests = await this.executePost('/quests/dropQuest/' + partyId + '/' + this.quest.id, {}, e);
            if (quests) {
                this.$emit('update-quests-by-name', quests);
            }
        },
    },
    data() {
        return {
            info: '',
            confirm: '',
            inviteUsername: '',
            dropdownUserId: '',
        };
    },
}
</script>

<style>
.font-8{
    font-size: 8pt;
}

.card-avatar-img {
    max-width: 36px;
    max-height: 36px;
    object-fit: cover;
    border-radius: 100%;
    box-shadow: 0 1px 0.5rem rgba(10, 10, 25);
    background-color: rgba(10, 10, 25);
}

.rank-restricted {
    background-color: rgba(200, 0, 0, 0.05)!important;
}

.overdue {
    background-color: rgba(255, 251, 0, 0.05)!important;
}

.fake-button-disable {
    pointer-events: none;
    opacity: 0.6;
}
</style>
