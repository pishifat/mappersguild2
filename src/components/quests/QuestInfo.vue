<template>

<div id="extendedInfo" class="modal fade" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content custom-bg-dark" v-if="quest">
            <div class="modal-header modal-header-card text-dark" :class="'bg-' + quest.status">
                <h5 class="modal-title modal-title-card">{{quest.name}}</h5>
                <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
                </button>
            </div>
            <div class="modal-body modal-body-card" style="overflow: hidden;">
                <img src="../../images/the_A.png" class="the-a-background">
                <div class="row" v-if="quest.art">
                    <p class="col-4"><a :href="'https://osu.ppy.sh/beatmaps/artists/' + quest.art"><img class='rounded-circle float-right quest-art-thumb' :src="'https://assets.ppy.sh/artists/' + quest.art + '/cover.jpg'"></a></p>
                    <p class="small col-8 text-shadow">{{quest.descriptionFluff}}</p>
                </div>
                <p v-else class="text-shadow small">{{quest.descriptionFluff}}</p>

                <p class="text-shadow">Objective: {{quest.descriptionMain}}</p>
                <hr>
                <span v-if="quest.status == 'open'">
                    <p class="text-shadow">Reward: {{quest.reward}} bonus points for each user <span v-if="quest.medal">+ a pack-exclusive medal</span></p>
                    <p class="text-shadow">Party size: {{quest.minParty}}-{{quest.maxParty}} members</p>
                    <p class="text-shadow">Required Rank: {{quest.minRank}}</p>
                    <p class="text-shadow">Timeframe: {{Math.round(quest.timeframe / (1000*60*60*24))}} days</p>
                    <p v-if="quest.exclusive" class="small text-shadow">Because this quest involves an unannounced Featured Artist, dropping it will make it unobtainable by any other party. If you've recently done a new FA quest, maybe give other mappers a chance!</p>
                    <hr>
                    <div v-if="!(!partyQuest && partyRank >= quest.minRank && partySize <= quest.maxParty && partySize >= quest.minParty)">
                        <p class="small text-shadow">You're unable to accept this quest because:</p>
                        <ul style="list-style-type: none" class="small text-shadow">
                            <li v-if="!partyName">You're not the leader of a party</li>
                            <li v-if="partyQuest && partyName">You can only handle one quest at a time</li>
                            <li v-if="partyRank < quest.minRank && partyName">Your party is below the quest's required rank</li>
                            <li v-if="partySize > quest.maxParty && partyName">Your party has too many members</li>
                            <li v-if="partySize < quest.minParty && partyName">Your party has too few members</li>
                        </ul>
                    </div>
                    <div v-if="!partyQuest && partyRank >= quest.minRank && partySize <= quest.maxParty && partySize >= quest.minParty">
                        <button class="btn btn-mg btn-sm accept float-right" @click="acceptQuest($event)">Accept</button>
                    </div>
                </span>
                <span v-if="quest.status == 'wip'">
                    <p class="text-shadow">Reward: {{quest.reward}} bonus points for each user <span v-if="quest.medal">+ a pack-exclusive medal</span></p>
                    <p class="text-shadow">Current Party: {{quest.assignedParty.name}}</p>
                    <p class='card-text text-shadow' style='margin-top:0.5rem'>Deadline: {{quest.deadline.slice(0,10)}}</p>
                    <span v-if="quest.associatedMaps.length">
                        <p class="text-shadow">Associated maps:</p>
                        <ul style="list-style-type: none;">
                            <li class="small text-shadow" v-for="map in quest.associatedMaps" :key="map.id">
                                <template v-if="map.url">
                                    <a :href="map.url" target="_blank">{{map.song.artist}} - {{map.song.title}}</a> by <a :href="'https://osu.ppy.sh/users/' + map.host.osuId" target="_blank">{{map.host.username}}</a>
                                </template>
                                <template v-else>
                                   {{map.song.artist}} - {{map.song.title}} by <a :href="'https://osu.ppy.sh/users/' + map.host.osuId" target="_blank">{{map.host.username}}</a>
                                </template>
                            </li>
                        </ul>
                    </span>
                    <div v-if="quest.id == partyQuest">
                        <hr>
                        <button class="btn btn-mg-used btn-sm float-right drop" @click="dropQuest($event)">Drop</button>
                    </div>
                </span>
            </div>
        </div>
    </div>
</div>

</template>

<script>
import mixin from "../../mixins.js";

export default {
    name: 'quest-info',
    props: [ 'quest', 'partyQuest', 'partyRank', 'partySize', 'partyName' ],
    mixins: [ mixin ],
    computed: {
        
    },
    methods: {
        acceptQuest: function (e) {
            this.$emit('accept-quest', {id: this.quest.id, e: e});
        },
        dropQuest: function (e) {
            this.$emit('drop-quest', {id: this.quest.id, e: e});
        }, 
    },
}
</script>