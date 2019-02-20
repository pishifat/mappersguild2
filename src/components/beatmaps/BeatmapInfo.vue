<template>
<div id="editBeatmap" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content custom-bg-dark" v-if="beatmap">
            <div class="modal-header text-dark" :class="'bg-' + beatmap.status.toLowerCase()">
                <h5 class="modal-title">
                    {{beatmap.song.artist}} - {{beatmap.song.title}} ({{beatmap.host.username}}) 
                    <i v-if="beatmap.mode == 'taiko'" class="fas fa-drum"></i>
                    <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt"></i>
                    <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream"></i>
                </h5>
                <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
                </button>
            </div>
            <div class="modal-body" style="overflow: hidden;">
                <img src="../../images/the_A.png" class="the-a-background">
                <div class="container">
                    <div class="row">
                        <div class="col-sm-6">
                            <div v-if="isHost && beatmap.status == 'WIP'" id="mode" class="mb-3">
                                <p class="text-shadow">Mode:
                                    <button class="btn btn-sm btn-mg-done" :disabled="beatmap.mode == 'osu'" @click="setMode(beatmap.id, 'osu', $event)" data-toggle="tooltip" data-placement="top" title="osu!"><i class="far fa-circle"></i></button> 
                                    <button class="btn btn-sm btn-mg-done" :disabled="beatmap.mode == 'taiko'" @click="setMode(beatmap.id, 'taiko', $event)" data-toggle="tooltip" data-placement="top" title="osu!taiko"><i class="fas fa-drum"></i></button> 
                                    <button class="btn btn-sm btn-mg-done" :disabled="beatmap.mode == 'catch'" @click="setMode(beatmap.id, 'catch', $event)" data-toggle="tooltip" data-placement="top" title="osu!catch"><i class="fas fa-apple-alt"></i></button> 
                                    <button class="btn btn-sm btn-mg-done" :disabled="beatmap.mode == 'mania'" @click="setMode(beatmap.id, 'mania', $event)" data-toggle="tooltip" data-placement="top" title="osu!mania"><i class="fas fa-stream"></i></button>
                                </p>
                            </div>
                            <!--<div id="newHost" v-if="isHost">
                                <div class="input-group input-group-sm mb-3">
                                    <input class="form-control form-control-sm custom-input" type="text" placeholder="username..." id="hostEntry" style="border-radius: 100px 0 0 100px;" maxlength="16" @keyup.enter="transferHost(beatmap.id, $event)" />
                                    <div class="input-group-append">
                                        <button style="border-radius: 0 100px 100px 0" class="rounded-circle-left btn btn-mg" type="submit"
                                            @click="transferHost(beatmap.id, $event)" data-toggle="tooltip" data-placement="right" title="request another user to host this mapset"
                                        >
                                            <span class="append-button-padding">Request to host</span>
                                        </button>
                                    </div>
                                </div>
                            </div>-->
                            <table class="small table text-shadow">
                                <thead>
                                    <td scope="col" style="padding: 2px;">Difficulty</td>
                                    <td scope="col" style="padding: 2px;">Mapper(s)</td>
                                    <td scope="col" style="padding: 2px;" v-if="beatmap.status != 'Ranked'">Status</td>
                                    <td scope="col" style="padding: 2px;" v-if="beatmap.status != 'Ranked'"></td>
                                </thead>
                                <transition-group tag="tbody" name="list" id="difficulties">
                                    <tr v-for="task in beatmap.tasks" :key="task.id" :id="task.id + 'Row'">
                                        <td scope="row" style="padding: 1px;">{{task.name}}</td>
                                        <td scope="row" style="padding: 1px;">
                                            <template v-for="(mapper, i) in task.mappers">
                                                <a :href="'https://osu.ppy.sh/users/' + mapper.osuId" target="_blank" :key="mapper.id">{{ mapper.username + (i < task.mappers.length - 1 ? ', ' : '') }}</a>
                                            </template>
                                            <a href='#' v-if="(isOwner(task.mappers))" :id="task.id + 'Collab'" :class="[task.status == 'Done' || beatmap.status == 'Done' ? 'fake-button-disable' : '', addCollabInput == task.id ? 'fake-collab-button-disable' : '']" class='icon-valid' @click.prevent="addCollabInput == task.id ? cancelCollab() : setCollab(task)" data-toggle="tooltip" data-placement="top" title="invite new collaborator"><i class="fas fa-plus-square"></i></a>
                                            <a href='#' v-if="(isOwner(task.mappers)) && task.mappers.length > 1" class='icon-used' :class="[task.status == 'Done' || beatmap.status == 'Done' ? 'fake-button-disable' : '', removeCollabInput == task.id ? 'fake-collab-button-disable' : '']" @click.prevent="removeCollabInput == task.id ? cancelCollab() : unsetCollab(task)" data-toggle="tooltip" data-placement="top" title="remove collaborator"><i class="fas fa-minus-square"></i></a>
                                        </td>
                                        <td scope="row" :class="task.status.toLowerCase()" style="padding: 1px;" v-if="beatmap.status != 'Ranked'">{{task.status}}</td>
                                        <td scope="row" style="padding: 1px;" v-if="beatmap.status != 'Ranked'">
                                            <a href='#' v-if="isOwner(task.mappers) || isHost" class='icon-used' :class="fakeButton == task.id ? 'fake-button-disable' : ''" @click.prevent="removeTask(task.id)" data-toggle="tooltip" data-placement="top" title="delete"><i class="fas fa-minus-square"></i></a>
                                            <span data-toggle="tooltip" data-placement="top" title="set status">
                                                <a href='#' v-if="(isOwner(task.mappers) || isHost) && task.status == 'WIP'" :class="fakeButton == task.id ? 'fake-button-disable' : ''" class='icon-done' @click.prevent="setTaskStatus(task.id, 'Done')"><i class="fas fa-check"></i></a>
                                                <a href='#' v-if="(isOwner(task.mappers) || isHost) && task.status == 'Done'" :class="beatmap.status == 'Done' || fakeButton == task.id ? 'fake-button-disable' : ''" class='icon-wip' @click.prevent="setTaskStatus(task.id, 'WIP')"><i class="fas fa-ellipsis-h"></i></a>
                                            </span>
                                        </td>
                                    </tr>
                                </transition-group>
                            </table>
                            <div id="newDifficulty" v-if="beatmap.status == 'WIP'" :class="beatmap.tasksLocked.length == 6 && !isHost ? 'fake-button-disable' : ''">
                                <div class="input-group input-group-sm mb-3">
                                    <select class="custom-select select-arrow small" id="diffSelection">
                                        <option v-if="beatmap.tasksLocked.indexOf('Easy') < 0 || isHost" value="Easy">Easy</option>
                                        <option v-if="beatmap.tasksLocked.indexOf('Normal') < 0 || isHost" value="Normal">Normal</option>
                                        <option v-if="beatmap.tasksLocked.indexOf('Hard') < 0 || isHost" value="Hard">Hard</option>
                                        <option v-if="beatmap.tasksLocked.indexOf('Insane') < 0 || isHost" value="Insane">Insane</option>
                                        <option v-if="beatmap.tasksLocked.indexOf('Expert') < 0 || isHost" value="Expert">Expert</option>
                                        <option v-if="beatmap.tasksLocked.indexOf('Storyboard') < 0 || isHost" value="Storyboard">Storyboard</option>
                                    </select>
                                    <div class="input-group-append">
                                        <button style="border-radius: 0 100px 100px 0;" class="rounded-circle-left btn btn-mg" id="addTask" @click="addTask(beatmap.id, $event);" data-toggle="tooltip" data-placement="top" title="add difficulty" :disabled="requestDiffInput"><i class="fas fa-plus append-button-padding"></i></button>
                                    </div>
                                    <a v-if="isHost" href="#" :class="requestDiffInput ? 'icon-used' : ''" class="icon-valid px-2 text-shadow pt-1" @click.prevent="requestDiffInput ? unsetRequest() : setRequest()"  data-toggle="tooltip" data-placement="top" title="request difficulty"><i class="fas fa-sign-out-alt"></i></a>
                                </div>
                            </div>
                            <div id="requestDiff" v-if="requestDiffInput">
                                <div class="input-group input-group-sm mb-3">
                                    <input class="form-control form-control-sm custom-input" type="text" placeholder="username..." id="requestEntry" style="border-radius: 100px 0 0 100px;" maxlength="16" @keyup.enter="requestTask(beatmap.id, $event)" />
                                    <div class="input-group-append">
                                        <button style="border-radius: 0 100px 100px 0" class="rounded-circle-left btn btn-mg" type="submit" @click="requestTask(beatmap.id, $event)" data-toggle="tooltip" data-placement="right" title="request another mapper to create the selected difficulty"><span class="append-button-padding">Request difficulty</span></button>
                                    </div>
                                </div>
                            </div>
                            <div id="newCollaborator">
                                <div v-if="addCollabInput" class="input-group input-group-sm mb-3">
                                    <input class="form-control form-control-sm" type="text" placeholder="collaborative mapper..." id="collabMapperToAdd" style="border-radius: 100px 0 0 100px" @keyup.enter="addCollab($event)" />
                                    <div class="input-group-append">
                                        <button style="border-radius: 0 100px 100px 0;" class="rounded-circle-left btn btn-mg" @click="addCollab($event)"><span class="append-button-padding">Invite to {{collabTask.name}}</span></button>
                                    </div>
                                </div>
                                <div v-if="removeCollabInput" class="input-group input-group-sm mb-3">
                                    <input class="form-control form-control-sm" type="text" placeholder="collaborative mapper..." id="collabMapperToRemove" style="border-radius: 100px 0 0 100px" @keyup.enter="removeCollab($event)" />
                                    <div class="input-group-append">
                                        <button style="border-radius: 0 100px 100px 0;" class="rounded-circle-left btn btn-mg-used" @click="removeCollab($event)"><span class="append-button-padding">Remove from {{collabTask.name}}</span></button>
                                    </div>
                                </div>
                            </div>
                            <div v-if="isHost" id="mapsetStatus">
                                <p class="text-shadow">Mapset status:
                                    <button class="btn btn-sm btn-mg-done" :disabled="beatmap.status == 'Done'" @click="setStatus('Done', $event);" data-toggle="tooltip" data-placement="bottom" title="mark set and all diffs as done">Done</button>
                                    <button class="btn btn-sm btn-mg-wip" :disabled="beatmap.status == 'WIP'" @click="setStatus('WIP', $event);" data-toggle="tooltip" data-placement="bottom" title="mark set as work-in-progress">WIP</button>
                                </p>
                            </div>
                        </div>

                        <div class="col-sm-6 bm-col-separator-left">
                            <p id="quest" class="text-shadow" v-if="beatmap.status != 'Ranked' || beatmap.quest">
                                Quest: 
                                <small>
                                    <span v-if="beatmap.quest">{{beatmap.quest.name}}</span>
                                    <span v-else><i>none</i></span>
                                </small>
                                <span data-toggle="tooltip" data-placement="right" title="connect mapset to your current quest">
                                    <a href='#' v-if="isHost && !beatmap.quest" id='editQuest' :class="fakeButton == beatmap.id + 'quest' ? 'fake-button-disable' : ''" class='icon-valid' @click.prevent="setQuest()"><i class="fas fa-plus-square"></i></a>
                                    <a href='#' v-if="isHost && beatmap.quest" id='editQuest' :class="fakeButton == beatmap.id + 'quest' ? 'fake-button-disable' : ''" class='icon-used' @click.prevent="unsetQuest()"><i class="fas fa-minus-square"></i></a>
                                </span>
                            </p>
                            <p id="modders" class="text-shadow">
                                Modders ({{beatmap.modders.length}}): 
                                <span v-if="beatmap.modders.length == 0" class="small text-shadow"><i>none</i></span>
                                <span v-else class="small text-shadow"><template v-for="(modder, i) in beatmap.modders">
                                    <a :href="'https://osu.ppy.sh/users/' + modder.osuId" target="_blank" :key="modder.id">{{ modder.username + (i < beatmap.modders.length - 1 ? ', ' : '') }}</a>
                                </template></span>
                                <span data-toggle="tooltip" data-placement="right" title="add/remove yourself from modder list" v-if="beatmap.status !='Ranked'">
                                    <a href="#" v-if="isModder && !isHost" class="mod-button icon-used" :class="fakeButton == beatmap.id + 'mod' ? 'fake-button-disable' : ''" @click.stop.prevent="updateModder()"><i class="fas fa-minus-square"></i></a>
                                    <a href="#" v-if="!isModder && !isHost" class="icon-valid mod-button" :class="fakeButton == beatmap.id + 'mod' ? 'fake-button-disable' : ''" @click.stop.prevent="updateModder()"><i class="fas fa-plus-square"></i></a>
                                </span>
                            </p>
                            <p id="bns" class="text-shadow" v-if="beatmap.status != 'Ranked'">
                                Potential Nominators ({{beatmap.bns.length}}): 
                                <span v-if="beatmap.bns.length == 0" class="small text-shadow"><i>none</i></span>
                                <span v-else class="small text-shadow"><template v-for="(bn, i) in beatmap.bns">
                                    <a :href="'https://osu.ppy.sh/users/' + bn.osuId" target="_blank" :key="bn.id">{{ bn.username + (i < beatmap.bns.length - 1 ? ', ' : '') }}</a>
                                </template></span>
                                <span data-toggle="tooltip" data-placement="right" title="add/remove yourself from potential BN list">
                                    <a href="#" v-if="isBn && !isHost" class="icon-used" :class="fakeButton == beatmap.id + 'bn' ? 'fake-button-disable' : ''" @click.prevent="updateBn()"><i class="fas fa-minus-square"></i></a>
                                    <a href="#" v-if="!isBn && !isHost && beatmap.bns.length < 2" :class="fakeButton == beatmap.id + 'bn' ? 'fake-button-disable' : ''" class="icon-valid" @click.prevent="updateBn()"><i class="fas fa-plus-square"></i></a>
                                </span>
                            </p>
                            <p id="mapLink" class="text-shadow">
                                Link: 
                                <a v-if="beatmap.url" class="small" :href="beatmap.url" target="_blank"><b>{{ shortUrl }}</b></a>
                                <i v-else class="small">none</i>
                                <a v-if="isHost" href="#" id='editLink' :class="editLinkInput ? 'icon-used' : ''" class="icon-valid" @click.prevent="editLinkInput ? unsetLink() : setLink()"  data-toggle="tooltip" data-placement="right" title="edit link"><i class="fas fa-edit"></i></a>
                            </p>
                            <p id="linkInput">
                                <div v-if="editLinkInput" class="input-group input-group-sm mb-3">
                                    <input class="form-control form-control-sm" type="text" placeholder="URL" id="newLink" style="border-radius: 100px 0 0 100px" @keyup.enter="saveLink($event)" />
                                    <div class="input-group-append">
                                        <button style="border-radius: 0 100px 100px 0;" class="rounded-circle-left btn btn-mg" type="submit" id="addLinkButton" @click="saveLink($event)" data-toggle="tooltip" data-placement="right" title="use new osu!web link for card image">
                                            <span class="append-button-padding">Save link</span>
                                        </button>
                                    </div>
                                </div>
                            </p>
                            <div id="locks" v-if="beatmap.status == 'WIP'">
                                <p class="text-shadow">Locked: <i v-if="beatmap.tasksLocked.length == 0" class="small">none</i></p>
                                <div id="lockedDiffs" class="text-shadow">
                                    <div class='ml-3 small' v-for="task in beatmap.tasksLocked" :key="task.id">
                                        <a href='#' v-if="isHost" class="icon-used" @click.prevent="unlockTask(task)" :class="fakeButton == task ? 'fake-button-disable' : ''"  data-toggle="tooltip" data-placement="left" title="unlock">
                                            <i class="fas fa-minus-square"></i>
                                        </a> 
                                        {{task}}
                                    </div>
                                </div>
                                <div id="newLock" v-if="beatmap.tasksLocked.length != 6 && isHost">
                                    <br v-if="beatmap.tasksLocked.length > 0">
                                    <div class="input-group input-group-sm mb-3">
                                        <select class="custom-select select-arrow small" id="lockDiffSelection">
                                            <option v-if="beatmap.tasksLocked.indexOf('Easy') < 0" value="Easy">Easy</option>
                                            <option v-if="beatmap.tasksLocked.indexOf('Normal') < 0" value="Normal">Normal</option>
                                            <option v-if="beatmap.tasksLocked.indexOf('Hard') < 0" value="Hard">Hard</option>
                                            <option v-if="beatmap.tasksLocked.indexOf('Insane') < 0" value="Insane">Insane</option>
                                            <option v-if="beatmap.tasksLocked.indexOf('Expert') < 0" value="Expert">Expert</option>
                                            <option v-if="beatmap.tasksLocked.indexOf('Storyboard') < 0" value="Storyboard">Storyboard</option>
                                        </select>
                                        <div class="input-group-append">
                                            <button style="border-radius: 0 100px 100px 0;" class="rounded-circle-left btn btn-mg" id="lockTask" @click="lockTask($event);" data-toggle="tooltip" data-placement="right" title="prevent other mappers from claiming a difficulty"><span class="append-button-padding">Lock</span></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-12">
                            <hr>
                            <p id="delete">
                                <p class="text-shadow" :class="isHost ? 'float-left' : 'float-right'">Created: {{beatmap.createdAt.slice(0,10)}}</p>
                                <button v-if="isHost" id="deleteButton" class="btn btn-sm btn-mg-used float-right" @click="deleteMap($event)">Delete</button>
                            </p>
                        </div>
                        <p id="errors" class="text-shadow" :class="inviteConfirm ? 'confirm' : 'errors'">{{info}} {{inviteConfirm}}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import mixin from "../../mixins.js";

export default {
    name: 'beatmap-info',
    props: [ 'userOsuId', 'beatmap', 'visible' ],
    mixins: [ mixin ],
    watch: {
        beatmap: function () {
            this.info = null;
            this.addCollabInput = null;
            this.removeCollabInput = null;
            this.editLinkInput = null;
            this.requestDiffInput = null;
            this.collabTask = null;
            this.fakeButton = null;
            this.sortDiffs();
        }
    },
    computed: {
        isHost: function () {
            return this.userOsuId == this.beatmap.host.osuId;
        },
        isModder: function () {
            let value;
            this.beatmap.modders.forEach(modder => {
                if(modder.osuId == this.userOsuId){
                    value = true;
                    return;
                }
            });
            return value;
        },
        isBn: function () {
            let value;
            this.beatmap.bns.forEach(bn => {
                if(bn.osuId == this.userOsuId){
                    value = true;
                    return;
                }
            });
            return value;
        },
        shortUrl: function () {
            if(this.beatmap.url.length > 40){
                return this.beatmap.url.slice(0, 40) + "...";
            }else{
                return this.beatmap.url;
            }
        },
    },
    methods: {
        executePost: async function(path, data, e) {
			if (e) e.target.disabled = true;
            $("[data-toggle='tooltip']").tooltip('hide');
            
			try {
				const res = await axios.post(path, data)
				
				if (res.data.error) {
                    this.info = res.data.error;
                    this.inviteConfirm = null;
				} else {
					return res.data;
				}
			} catch (error) {
                this.info = 'Something went wrong';
            }
            
            if (e) e.target.disabled = false;
        },
        sortDiffs: function(){
            let sortOrder = ["Easy", "Normal", "Hard", "Insane", "Expert", "Storyboard"]
            this.beatmap.tasks.sort(function(a, b) {
                return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
            });
        },
        isOwner(mappers){
            let value;
            mappers.forEach(mapper => {
                if(mapper.osuId == this.userOsuId){
                    value = true;
                    return;
                }
            });
            return value;
        },
        
        //real methods

        //mode
        setMode: async function(id, mode, e){
            const bm = await this.executePost('/beatmaps/setMode/' + id, {mode: mode}, e);
            if(bm){
                this.$emit('update-map', bm);
            }
        },

        //host
        transferHost: async function(id, e){
            const user = $('#hostEntry').val();
            const bm = await this.executePost('/beatmaps/transferHost/' + id, {user: user}, e);
            if(bm){
                this.info = null;
                this.inviteConfirm = "Transfer host invite sent!"
            }
        },

        //difficulties
        setCollab(task){
            this.addCollabInput = task._id;
            this.removeCollabInput = null;
            this.requestDiffInput = null;
            this.collabTask = task;
        },
        unsetCollab(task){
            this.removeCollabInput = task._id;
            this.addCollabInput = null;
            this.requestDiffInput = null;
            this.collabTask = task;
        },
        cancelCollab(){
            this.removeCollabInput = null;
            this.addCollabInput = null;
        },
        removeTask: async function(id) {
            this.fakeButton = id;
            this.addCollabInput = null;
            this.removeCollabInput = null;
            const bm = await this.executePost('/beatmaps/removeTask/' + id, { beatmapId: this.beatmap._id });
            if (bm) {
                this.$emit('update-map', bm);
            }
            this.fakeButton = null;
        },
        setTaskStatus: async function(id, status){
            this.fakeButton = id;
            this.addCollabInput = null;
            this.removeCollabInput = null;
            const bm = await this.executePost('/beatmaps/setTaskStatus/' + id, {status: status});
            if(bm){
                this.$emit('update-map', bm);
            }
            this.fakeButton = null;
        },
        addTask: async function(id, e){
            let difficulty = $("#diffSelection").val();
            const bm = await this.executePost('/beatmaps/addTask/' + id, {difficulty: difficulty}, e);
            if(bm){
                this.$emit('update-map', bm);
            }
        },
        setRequest(){
            this.requestDiffInput = true;
            this.addCollabInput = null;
            this.removeCollabInput = null;
        },
        unsetRequest(){
            this.requestDiffInput = null;
            this.addCollabInput = null;
            this.removeCollabInput = null;
        },
        requestTask: async function(id, e){
            let difficulty = $("#diffSelection").val();
            let recipient = $("#requestEntry").val();
            const bm = await this.executePost('/beatmaps/requestTask/' + id, {difficulty: difficulty, recipient: recipient}, e);
            if(bm){
                this.$emit('update-map', bm);
                this.info = null;
                this.inviteConfirm = "Difficulty request sent!"
            }
        },
        addCollab: async function(e){
            const user = $('#collabMapperToAdd').val();
            const id = this.addCollabInput;
            const bm = await this.executePost('/beatmaps/task/' + id + '/addCollab', {user: user}, e);
            if(bm){
                this.$emit('update-map', bm);
                this.info = null;
                this.inviteConfirm = "Collab invite sent!"
                this.addCollabInput = null;
            }
        },
        removeCollab: async function(e){
            const user = $('#collabMapperToRemove').val();
            const id = this.removeCollabInput;
            const bm = await this.executePost('/beatmaps/task/' + id + '/removeCollab', {user: user}, e);
            if(bm){
                this.$emit('update-map', bm);
                this.removeCollabInput = null;
            }
        },

        //status
        setStatus: async function(status, e){
            const bm = await this.executePost('/beatmaps/setStatus/' + this.beatmap._id, {status: status}, e);
            if(bm){
                this.$emit('update-map', bm);
                axios
                .get('/beatmaps/relevantInfo')
                .then(response => {
                    this.$parent.beatmaps = response.data.beatmaps;
                });
            }
        },

        //quest
        setQuest: async function(){
            this.fakeButton = this.beatmap._id + 'quest';
            const bm = await this.executePost('/beatmaps/setQuest/' + this.beatmap._id);
            if(bm){
                if(bm.status == "WIP"){
                    $(`#${bm.quest.name.split(' ').join('')}Wip`).collapse("show");
                    $(`.non-quest-collapse-wip`).collapse();
                }else{
                    $(`#${bm.quest.name.split(' ').join('')}Done`).collapse("show");
                    $(`.non-quest-collapse-done`).collapse();
                }
                this.$emit('update-map', bm);
                axios
                    .get('/beatmaps/relevantInfo')
                    .then(response => {
                        this.$parent.allQuests = response.data.allQuests;
                        this.$parent.beatmaps = response.data.beatmaps;
                    });
            }
            this.fakeButton = null;
        },
        unsetQuest: async function(){
            this.fakeButton = this.beatmap._id + 'quest';
            const bm = await this.executePost('/beatmaps/unsetQuest/' + this.beatmap._id);
            if(bm){
                this.$emit('update-map', bm);
            }
            this.fakeButton = null;
            /* const questIndex = this.$parent.wipQuests.findIndex(q => q.id == bm.quest.id);
			this.$parent.wipQuests[questIndex].associatedMaps.slice();
            beatmap = bm;
            this.$parent.info = null;
            this.sortDiffs();
            this.$parent.wipQuests.fin */
            axios
                .get('/beatmaps/relevantInfo')
                .then(response => {
                    this.$parent.allQuests = response.data.allQuests;
                    this.$parent.beatmaps = response.data.beatmaps;
                });
        },

        //mod
        updateModder: async function(){
            this.fakeButton = this.beatmap._id + "mod";
            const bm = await this.executePost('/beatmaps/updateModder/' + this.beatmap._id);
            if(bm){
                this.$emit('update-map', bm);
            }
            this.fakeButton = null;
        },

        //BN
        updateBn: async function(){
            this.fakeButton = this.beatmap._id + "bn";
            const bm = await this.executePost('/beatmaps/updateBn/' + this.beatmap._id);
            if(bm){
                this.$emit('update-map', bm);
            }
            this.fakeButton = null;
        },

        //link
        setLink(){
            this.editLinkInput = true;
        },
        unsetLink(){
            this.editLinkInput = null;
        },
        saveLink: async function(e){
            let url = $("#newLink").val();
            const bm = await this.executePost('/beatmaps/setLink/' + this.beatmap._id, {url: url}, e);
            if(bm){
                this.editLinkInput = null;
                this.$emit('update-map', bm);
            }
        },
        
        //locks
        unlockTask: async function(difficulty){
            this.fakeButton = difficulty;
            const bm = await this.executePost('/beatmaps/unlockTask/' + this.beatmap._id, {difficulty: difficulty});
            if(bm){
                this.editLinkInput = null;
                this.$emit('update-map', bm);
            }
        },
        lockTask: async function(e){
            this.fakeButton = null;
            let difficulty = $("#lockDiffSelection").val();
            const bm = await this.executePost('/beatmaps/lockTask/' + this.beatmap._id, {difficulty: difficulty}, e);
            if(bm){
                this.$emit('update-map', bm);
            }
        },

        //delete
        deleteMap: async function(e){
            const result = confirm(`Are you sure you want to delete?`);
			if (result) {
                e.target.disabled = true;
                const bm = await this.executePost('/beatmaps/delete/' + this.beatmap._id, e);
                if(bm){
                    $('#editBeatmap').modal('hide');
                    const i = this.$parent.beatmaps.findIndex(b => b.id == bm.id);
                    this.$parent.beatmaps.splice(i, 1);
                    e.target.disabled = false;
                }
            }
        },
    },
    data () {
		return { 
            inviteConfirm: null,
            addCollabInput: null,
            removeCollabInput: null,
            editLinkInput: null,
            requestDiffInput: null,
            collabTask: null,
            fakeButton: null,
            info: null,
		}
    },
}
</script>

<style>

</style>
