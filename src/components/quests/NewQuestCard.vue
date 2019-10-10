<template>
<div class="col-sm-12 my-1">
    <div class="card static-card" :class="quest.minRank ? 'rank-restricted' : 'bg-dark'">
        <div class="text-shadow min-spacing">
            <div class="min-spacing mt-1 row">
                <span class="col-sm-5">
                    <img :src="quest.art ? 'https://assets.ppy.sh/artists/' + quest.art + '/cover.jpg' : '../../images/no-art-icon.png'" class="card-avatar-img">
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
                        :title="quest.minParty + '-' + quest.maxParty + ' users'"
                    >
                        <i v-for="i in quest.minParty" :key="i" class="fas fa-user"></i><i v-for="i in quest.maxParty - quest.minParty" :key="i+100" class="fas text-white-50 fa-user"></i>
                    </span>
                </span>
                <span class="small min-spacing col-sm-1 mt-1">
                    Reward:
                    <span 
                        class="text-white-50"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="flat points bonus per user, additional ~2 points per difficulty"
                    >{{quest.reward}}pts
                    </span>
                </span>
                <span class="small min-spacing col-sm-1 mt-1">
                    Time: 
                    <span class="text-white-50">{{Math.round(quest.timeframe / (1000*60*60*24))}} days</span>
                </span>
                <span class="small min-spacing col-sm-1 mt-1">
                    Medal: 
                    <i class="fas text-white-50" :class="quest.medal ? 'fa-check' : 'fa-times'"></i>
                </span>
                <span class="small min-spacing col-sm-1 mt-1">
                    Rank: 
                    <span class="text-white-50">{{quest.minRank}}</span>
                </span>
            </div>
        </div>
        <div class="card-header min-spacing pb-1 pl-2">
            <span class="small text-shadow">Objective:</span>
            <span class="small text-shadow text-white-50">{{quest.descriptionMain}}</span>
        </div>
        <!--collapsed info-->
        <div :id="'details' + quest.id" class="collapse ml-4 my-2 row bg-darker">   
            <div v-if="quest.status == 'open'" class="col-sm-12">
                <p class="sub-header text-shadow min-spacing">
                    <button v-if="notInParty()" class="btn btn-sm btn-outline-info" @click.prevent="createParty($event)">Add party <i class="fas fa-plus small"></i></button>
                </p>
                <div v-for="party in quest.parties" :key="party.id">
                    <div class="row">
                        <p class="sub-header col-sm-3 text-shadow min-spacing">
                            <i v-if="party.lock" class="fas fa-lock small"></i>
                            <i v-else class="fas fa-unlock small"></i>
                            <u><a :href="'https://osu.ppy.sh/users/' + party.leader.osuId" _target="blank">{{party.leader.username}}</a>'s party</u>
                        </p>
                        <div v-if="party.leader.id == userId" class="col-sm-2 mx-2 min-spacing input-group input-group-sm">
                            <input
                                class="form-control form-control-sm"
                                type="text"
                                placeholder="username..."
                                maxlength="18"
                                @keyup.enter="invite($event)"
                            />
                            <span class="input-group-append">
                                <button
                                    class="btn btn-outline-info"
                                    @click="invite($event)"
                                >
                                    Invite
                                </button>
                            </span>
                        </div>
                        <div v-if="party.leader.id == userId" class="col-sm-2 mx-2 min-spacing input-group input-group-sm">
                            <input
                                class="form-control form-control-sm"
                                type="text"
                                placeholder="username..."
                                id="collabMapperToAdd"
                                @keyup.enter="invite($event)"
                            />
                            <span class="input-group-append">
                                <button
                                    class="btn btn-outline-info"
                                    @click="invite($event)"
                                >
                                    Invite
                                </button>
                            </span>
                        </div>
                        <div v-if="party.leader.id == userId" class="col-sm-3">
                            <button v-if="!party.lock" class="btn btn-sm btn-outline-info mx-2" @click.prevent="togglePartyLock(party.id, party.lock, $event)">Lock <i class="fas fa-lock small"></i></button>
                            <button v-else class="btn btn-sm btn-outline-info mx-2" @click.prevent="togglePartyLock(party.id, party.lock, $event)">Unlock <i class="fas fa-unlock"></i></button>
                            <button class="btn btn-sm btn-outline-danger mx-2" @click.prevent="deleteParty(party.id, $event)">Delete <i class="fas fa-minus small"></i></button>
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
                        </li>
                    </ul>
                </div>
           </div>



            
            <div v-if="quest.status == 'wip'" class="col-sm-6">
                <p class="sub-header text-shadow min-spacing"><u><a :href="'https://osu.ppy.sh/users/' + quest.parties[0].leader.osuId" _target="blank">{{quest.parties[0].leader.username}}</a>'s party</u></p>
                <p class='small text-shadow min-spacing ml-3'>
                    Deadline: 
                    <span class="text-white-50">{{quest.deadline.slice(0,10)}}</span>
                </p>
                <p class='small text-shadow min-spacing ml-3'>
                    Time remaining:
                    <span :class="timeRemaining(quest.deadline) > 0 ? 'text-white-50' : 'icon-used'">{{timeRemaining(quest.deadline)}} days</span>
                </p>
                <p class='small text-shadow min-spacing ml-3'>
                    Members: 
                </p>
                <ul class="min-spacing ml-4">
                    <li class="text-shadow small" v-for="member in quest.parties[0].members" :key="member.id">
                        <a :href="'https://osu.ppy.sh/users/' + member.osuId" target="_blank">
                            {{ member.username }}
                        </a>
                    </li>
                </ul>
            </div>
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
                    <li class="text-shadow small" v-for="member in quest.completedMembers" :key="member.id"><a :href="'https://osu.ppy.sh/users/' + member.osuId" target="_blank">{{ member.username }}</a></li>
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
            </div>
            
        </div>
    </div>
</div>


</template>

<script>
export default {
    name: 'new-quest-card',
    props: ['quest', 'userId'],
    methods: {
        executePost: async function(path, data, e) {
            if (e) e.target.disabled = true;

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
        //functionality
        createParty: async function(e) {
            const quest = await this.executePost('/new/createParty/' + this.quest.id, {}, e);
            if (quest) {
                this.$emit('update-quest', quest);
            }
        },
        deleteParty: async function(partyId, e) {
            const quest = await this.executePost('/new/deleteParty/' + partyId + '/' + this.quest.id, {}, e);
            if (quest) {
                this.$emit('update-quest', quest);
            }
        },
        togglePartyLock: async function(partyId, lock, e) {
            const quest = await this.executePost('/new/togglePartyLock/' + partyId + '/' + this.quest.id, { lock }, e);
            if (quest) {
                this.$emit('update-quest', quest);
            }
        },
        invite: async function(e) {
            const success = await this.executePost('/new/invite', { user: this.inviteUsername }, e);
            if (success) {
                this.inviteConfirm = 'Invite sent!'; //this doesnt exist yet
                this.info = '';
            }
        },
    },
    data() {
        return {
            info: '',
            inviteUsername: '',
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

.fake-button-disable {
    pointer-events: none;
    opacity: 0.6;
}
</style>
