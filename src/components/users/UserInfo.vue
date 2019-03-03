<template>

<div id="extendedInfo" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content custom-bg-dark" v-if="user">
            <div class="modal-header text-dark" :class="'bg-rank-' + user.rank">
                <h5 class="modal-title">{{user.username}}</h5>
                <button type="button" class="close" data-dismiss="modal">
                    <span>&times;</span>
                </button>
            </div>
            <div class="modal-body" style="overflow: hidden">
                <img src="../../images/the_A.png" class="the-a-background">
                <div class="row col-lg-12">
                    <table class="small table text-shadow col-md-6">
                        <thead>
                            <td scope="col" style="padding: 2px;">Task</td>
                            <td scope="col" style="padding: 2px;">Points</td>
                        </thead>
                        <tbody>
                            <tr v-if="user.easyPoints">
                                <td scope="row" style="padding: 1px;" data-toggle="tooltip" data-placement="left"
                                    title="5 points per difficulty. +2 if quest mapset">Mapping <i
                                        class="easy">Easy</i> difficulties</td>
                                <td scope="row" style="padding: 1px;">{{Math.round(user.easyPoints*10)/10}}
                                </td>
                            </tr>
                            <tr v-if="user.normalPoints">
                                <td scope="row" style="padding: 1px;" data-toggle="tooltip" data-placement="left"
                                    title="6 points per difficulty. +2 if quest mapset">Mapping <i
                                        class="normal">Normal</i> difficulties</td>
                                <td scope="row" style="padding: 1px;">
                                    {{Math.round(user.normalPoints*10)/10}}</td>
                            </tr>
                            <tr v-if="user.hardPoints">
                                <td scope="row" style="padding: 1px;" data-toggle="tooltip" data-placement="left"
                                    title="7 points per difficulty. +2 if quest mapset">Mapping <i
                                        class="hard">Hard</i> difficulties</td>
                                <td scope="row" style="padding: 1px;">{{Math.round(user.hardPoints*10)/10}}
                                </td>
                            </tr>
                            <tr v-if="user.insanePoints">
                                <td scope="row" style="padding: 1px;" data-toggle="tooltip" data-placement="left"
                                    title="8 points per difficulty. +2 if quest mapset">Mapping <i
                                        class="insane">Insane</i> difficulties</td>
                                <td scope="row" style="padding: 1px;">
                                    {{Math.round(user.insanePoints*10)/10}}</td>
                            </tr>
                            <tr v-if="user.expertPoints">
                                <td scope="row" style="padding: 1px;" data-toggle="tooltip" data-placement="left"
                                    title="8 points per difficulty. +2 if quest mapset">Mapping <i
                                        class="expert">Expert</i> difficulties</td>
                                <td scope="row" style="padding: 1px;">
                                    {{Math.round(user.expertPoints*10)/10}}</td>
                            </tr>
                            <tr v-if="user.storyboardPoints">
                                <td scope="row" style="padding: 1px;" data-toggle="tooltip" data-placement="left"
                                    title="10 points per storyboard. +2 if quest mapset">Creating storyboards</td>
                                <td scope="row" style="padding: 1px;">
                                    {{Math.round(user.storyboardPoints*10)/10}}</td>
                            </tr>
                            <tr v-if="user.questPoints">
                                <td scope="row" style="padding: 1px;" data-toggle="tooltip" data-placement="left"
                                    title="points reward varies between quests">Completing quests</td>
                                <td scope="row" style="padding: 1px;">
                                    {{Math.round(user.questPoints*10)/10}}</td>
                            </tr>
                            <tr v-if="user.modPoints">
                                <td scope="row" style="padding: 1px;" data-toggle="tooltip" data-placement="left"
                                    title="1 point per mod">Modding mapsets</td>
                                <td scope="row" style="padding: 1px;">{{Math.round(user.modPoints*10)/10}}
                                </td>
                            </tr>
                            <tr v-if="user.hostPoints">
                                <td scope="row" style="padding: 1px;" data-toggle="tooltip" data-placement="left"
                                    title="5 points per mapset hosted">Hosting mapsets</td>
                                <td scope="row" style="padding: 1px;">{{Math.round(user.hostPoints*10)/10}}
                                </td>
                            </tr>
                            <tr v-if="user.legacyPoints">
                                <td scope="row" style="padding: 1px;" data-toggle="tooltip" data-placement="left"
                                    title="points for tasks that, after going public, were no longer applicable">Legacy points
                                </td>
                                <td scope="row" style="padding: 1px;">
                                    {{Math.round(user.legacyPoints*10)/10}}</td>
                            </tr>
                            <tr v-if="user.penaltyPoints">
                                <td scope="row" style="padding: 1px;" data-toggle="tooltip" data-placement="left"
                                    title="penalty for dropping a quest. inverse of a quest's reward">Dropping
                                    quests</td>
                                <td scope="row" style="padding: 1px;">
                                    -{{Math.round(user.penaltyPoints*10)/10}}</td>
                            </tr>
                            <tr>
                                <td scope="row" style="padding: 1px;" data-toggle="tooltip" data-placement="left"
                                    title="all points rewarded when map is ranked/quest is completed. collaborations split points">
                                    <i>Total points</i></td>
                                <td scope="row" style="padding: 1px;">{{user.totalPoints}}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class='col-md-6'>
                        <p class="text-shadow">Party:
                            <span v-if="user.currentParty">{{user.currentParty.name}}</span>
                            <span v-else><i>none</i></span>
                        </p>
                        <p class="text-shadow" data-toggle="tooltip" data-placement="left" title="rank thresholds are 100, 250, and 500 points">
                            Rank: {{user.rank}}
                        </p>
                        <p v-if="user.completedQuests.length" class="text-shadow">Completed Quests: </p>
                        <ul style="list-style-type: none;" id="questDetails">
                            <li class='ml-3 small text-shadow' v-for="quest in user.completedQuests" :key="quest.id">
                                {{quest.name}}
                            </li>
                        </ul>
                        <p class="text-shadow">
                            Invites: {{user.invites ? "Enabled" : "Disabled"}}
                        </p>
                    </div>
                </div>
                <hr>
                <span v-if="userMaps.length">
                <p class="text-shadow">Mappers' Guild Maps:</p>
                <table class="small table text-shadow">
                    <thead>
                        <td scope="col" style="padding: 2px;">Mapset</td>
                        <td scope="col" style="padding: 2px;">Host</td>
                        <td scope="col" style="padding: 2px;">Status</td>
                        <td scope="col" style="padding: 2px;">Tasks</td>
                    </thead>
                    <tbody>
                        <tr v-for="map in userMaps" :key="map.id">
                            <td scope="row" style="padding: 1px;">
                                <template v-if="map.url">
                                    <a :href="map.url" target="_blank">
                                        {{map.song.artist}} - {{map.song.title}}
                                    </a>
                                </template>
                                <template v-else>
                                    <span>{{map.song.artist}} - {{map.song.title}}</span>
                                </template>
                            </td>
                            <td scope="row" style="padding: 1px;">
                                <a :href="'https://osu.ppy.sh/users/' + map.host.osuId" target="_blank">
                                    {{map.host.username}}
                                </a>
                            </td>
                            <td scope="row" style="padding: 1px;" :class="map.status.toLowerCase()">
                                {{map.status}}
                            </td>
                            <td scope="row" style="padding: 1px;">
                                {{userTasks(map)}}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <hr>
                </span>
                <button 
                    v-if="user.osuId == userId"
                    class="btn btn-sm justify-content-center" 
                    :class="{ 'btn-mg': !user.invites, 'btn-mg-used': user.invites }" 
                    @click="switchInvites($event)"
                >
                    {{user.invites ? 'Disable invites' : 'Enable invites'}}
                </button>
                <p class="text-shadow float-right">Joined: {{user.createdAt.slice(0,10)}}</p>
            </div>
        </div>
    </div>
</div>

</template>

<script>
import mixin from "../../mixins.js";

export default {
    name: 'user-info',
    props: [ 'user', 'beatmaps', 'userId' ],
    mixins: [ mixin ],
    computed: {
        userMaps: function () {
            return this.beatmaps.filter(b => {
                return b.tasks.some(t => {
                    return t.mappers.some(m => {
                        return m.id == this.user.id;
                    })
                });
            });
        },
    },
    methods: {
        selectBeatmap: function (map) {
            $("#extendedInfo").css("z-index", "10");
            this.$emit('update:selectedMap', map);
        },
        executePost: async function (path, data, e) {
            if (e) e.target.disabled = true;

            try {
                const res = await axios.post(path, data)
                console.log(res);

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
        userTasks: function (beatmap) {
            let tasks = "";
            beatmap.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if (mapper._id == this.user.id) {
                        tasks += task.name + ", "
                    }
                });
            });
            return tasks.slice(0, -2);
        },
        switchInvites: async function(e){
            const u = await this.executePost('/users/switchInvites/', {}, e);
            if(u){
                this.$emit('update-user', u);
            }
        },
    },
}
</script>