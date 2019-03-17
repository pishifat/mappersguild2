<template>
<div id="discussionInfo" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content custom-bg-dark" v-if="discussApp || discussRound">
            <div class="modal-header text-dark bg-qat-logo">
                <h5 v-if="discussApp" class="modal-title">
                    Application Evaluation: <a @click.stop :href="'https://osu.ppy.sh/users/' + discussApp.applicant.osuId" class="text-dark" target="_blank">{{discussApp.applicant.username}}</a>
                    <i v-if="discussApp.mode == 'osu'" class="far fa-circle"></i>
                    <i v-else-if="discussApp.mode == 'taiko'" class="fas fa-drum"></i>
                    <i v-else-if="discussApp.mode == 'catch'" class="fas fa-apple-alt"></i>
                    <i v-else-if="discussApp.mode == 'mania'" class="fas fa-stream"></i>
                </h5>
                <h5 v-else class="modal-title">
                    BN Evaluation: <a @click.stop :href="'https://osu.ppy.sh/users/' + discussRound.bn.osuId" class="text-dark" target="_blank">{{discussRound.bn.username}}</a>
                    <i v-if="discussRound.mode == 'osu'" class="far fa-circle"></i>
                    <i v-else-if="discussRound.mode == 'taiko'" class="fas fa-drum"></i>
                    <i v-else-if="discussRound.mode == 'catch'" class="fas fa-apple-alt"></i>
                    <i v-else-if="discussRound.mode == 'mania'" class="fas fa-stream"></i>
                </h5>
            </div>
            <div class="modal-body" style="overflow: hidden;">
                <div class="container">
                    <div class="row">
                        <div v-if="discussApp" class="col-sm-12">
                            <p class="text-shadow">Submitted mods:</p>
                            <ul style="list-style-type: none;">
                                <li class="small text-shadow" v-for="(mod, i) in discussApp.mods" :key="i">
                                    <a :href="modUrl(mod)" target="_blank">{{modUrl(mod)}}</a>
                                </li>
                            </ul>
                            <p class="text-shadow">Test results: <a href="#">20/20 <i class="fas fa-angle-right"></i></a></p>
                            <h5 class="text-shadow mb-2">Consensus:
                                <span v-if="discussApp.consensus" :class="'vote-' + discussApp.consensus">{{discussApp.consensus}}</span>
                                <span v-else>none</span>
                                <button
                                    class="btn btn-sm btn-qat-pass"
                                    :disabled="discussApp.consensus == 'pass' "
                                    @click="setConsensus('pass', $event);"
                                >Set Pass</button>
                                <button
                                    class="btn btn-sm btn-qat-fail"
                                    :disabled="discussApp.consensus == 'fail'"
                                    @click="setConsensus('fail', $event);"
                                >Set Fail</button>
                            </h5>
                            <hr>
                        </div>
                        <div v-else class="col-sm-12">
                            <p class="text-shadow">Disqualifications:</p>
                            <table class="small table text-shadow col-md-12">
                                <thead>
                                    <td scope="col" style="padding: 2px;">Date</td>
                                    <td scope="col" style="padding: 2px;">Mapset</td>
                                    <td scope="col" style="padding: 2px;">Short reason</td>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td scope="row" style="padding: 1px;">2019-03-04</td>
                                        <td scope="row" style="padding: 1px;"><a href="#">Anime - Music</a></td>
                                        <td scope="row" style="padding: 1px;">someone really messed up wow</td>
                                    </tr>
                                    <tr>
                                        <td scope="row" style="padding: 1px;">2019-03-04</td>
                                        <td scope="row" style="padding: 1px;"><a href="#">dd - sd</a></td>
                                        <td scope="row" style="padding: 1px;">sucky suck</td>
                                    </tr>
                                    <tr>
                                        <td scope="row" style="padding: 1px;">2019-03-04</td>
                                        <td scope="row" style="padding: 1px;"><a href="#">eee - assss</a></td>
                                        <td scope="row" style="padding: 1px;">asdfdsf</td>
                                    </tr>
                                    <tr>
                                        <td scope="row" style="padding: 1px;">2019-03-04</td>
                                        <td scope="row" style="padding: 1px;"><a href="#">hanatan - anim</a></td>
                                        <td scope="row" style="padding: 1px;">dfsfdddd</td>
                                    </tr>
                                    <tr>
                                        <td scope="row" style="padding: 1px;">2019-03-04</td>
                                        <td scope="row" style="padding: 1px;"><a href="#">My - Song</a></td>
                                        <td scope="row" style="padding: 1px;">aaaaaaaaaaa</td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <p v-if="relevantReports.length" class="text-shadow">Reports:</p>
                            <div v-for="report in relevantReports" :key="report.id">
                                <p class="text-shadow small pl-2" :class="report.valid == 1 ? 'vote-pass' : 'vote-extend'">
                                    {{report.createdAt.slice(0,10)}}: {{report.reason}}
                                </p>
                            </div>
                            
                            <h5 class="text-shadow mb-2">Consensus:
                                <span v-if="discussRound.consensus" :class="'vote-' + discussRound.consensus">{{discussRound.consensus}}</span>
                                <span v-else>none</span>
                                <span v-if="!readOnly">
                                <button
                                    class="btn btn-sm btn-qat-pass"
                                    :disabled="discussRound.consensus == 'pass' "
                                    @click="setConsensus('pass', $event);"
                                >Set Pass</button>
                                <button
                                    class="btn btn-sm btn-qat-extend"
                                    :disabled="discussRound.consensus == 'extend' "
                                    @click="setConsensus('extend', $event);"
                                >Set Extend</button>
                                <button
                                    class="btn btn-sm btn-qat-fail"
                                    :disabled="discussRound.consensus == 'fail'"
                                    @click="setConsensus('fail', $event);"
                                >Set Fail</button>
                                </span>
                            </h5>
                            <hr>
                        </div>
                        
                        <div v-if="discussApp" class="col-sm-12 row text-shadow">
                            <div class="col-sm-12 row text-shadow" v-for="evaluation in discussApp.evaluations" :key="evaluation.id">
                                <div :class="evaluation.evaluator.username.length > 10 ? 'col-sm-3' : 'col-sm-2'">
                                    <p :class=" evaluation.vote == 1 ? 'vote-pass' : evaluation.vote == 2 ? 'vote-neutral' : 'vote-fail'">{{evaluation.evaluator.username}}</p> 
                                </div>
                                <div class="small" :class="evaluation.evaluator.username.length > 10 ? 'col-sm-9' : 'col-sm-10'">
                                    <p class="mb-1">Behavior: {{evaluation.behaviorComment}}</p> 
                                    <p>Modding: {{evaluation.moddingComment}}</p>
                                </div>
                            </div>
                        </div>
                        <div v-else class="col-sm-12 row text-shadow">
                            <div class="col-sm-12 row text-shadow" v-for="evaluation in discussRound.evaluations" :key="evaluation.id">
                                <div :class="evaluation.evaluator.username.length > 10 ? 'col-sm-3' : 'col-sm-2'">
                                    <p :class=" evaluation.vote == 1 ? 'vote-pass' : evaluation.vote == 2 ? 'vote-extend' : 'vote-fail'">{{evaluation.evaluator.username}}</p> 
                                </div>
                                <div class="small" :class="evaluation.evaluator.username.length > 10 ? 'col-sm-9' : 'col-sm-10'">
                                    <p class="mb-1">Behavior: {{evaluation.behaviorComment}}</p> 
                                    <p>Modding: {{evaluation.moddingComment}}</p>
                                </div>
                            </div>
                        </div>


                        <div class="col-sm-12" v-if="!readOnly">
                            <hr>
                        </div>
                        <div class="col-sm-6" v-if="!readOnly">
                            <p class="text-shadow">Behavior/attitude comments:</p>
                            <div class="form-group">
                                <textarea class="form-control dark-textarea" id="behaviorComments" rows="4" v-model="behaviorComment"></textarea>
                            </div>
                        </div>
                        <div class="col-sm-6" v-if="!readOnly">
                            <p class="text-shadow">Modding comments:</p>
                            <div class="form-group">
                                <textarea class="form-control dark-textarea" id="moddingComments" rows="4" v-model="moddingComment"></textarea>
                            </div>
                        </div>
                        <div class="col-sm-12 mb-2" v-if="!readOnly">
                            <span class="mr-3 text-shadow">Vote:</span>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="vote" id="1d" value="1" :checked="vote == 1">
                                <label class="form-check-label text-shadow vote-pass" for="1d">Pass</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="vote" id="2d" value="2" :checked="vote == 2">
                                <label v-if="discussApp" class="form-check-label text-shadow vote-neutral" for="2d">Neutral</label>
                                <label v-else class="form-check-label text-shadow vote-extend" for="2d">Extend</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="vote" id="3d" value="3" :checked="vote == 3">
                                <label class="form-check-label text-shadow vote-fail" for="3d">Fail</label>
                            </div>
                        </div>
                    </div>
                    <div :class="this.info.length ? 'errors' : 'confirm'" class="text-shadow ml-2" style="min-height: 24px;">{{info}} {{confirm}}</div>
                </div>
            </div>
            <div v-if="!readOnly" class="modal-footer" style="overflow: hidden;">
                <button class="btn btn-sm btn-qat" @click="submitEval($event)">{{evaluationId ? 'Update Evaluation' : 'Submit Evaluation'}}</button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import mixin from "../../mixins.js";

export default {
    name: 'discuss-info',
    props: [ 'discuss-app', 'discuss-round', 'evaluator', 'reports', 'read-only' ],
    mixins: [ mixin ],
    computed: {
        
    },
    watch: {
        discussApp: function() {
            this.info = '';
            this.confirm = '';
            this.findRelevantEval();
        },
        discussRound: function() {
            this.info = '';
            this.confirm = '';
            this.findRelevantEval();
            if(this.reports && this.reports.length) this.findRelevantReports();
        },
    },
    methods: {
        executePost: async function (path, data, e) {
            this.info = '';
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
        //display
        findRelevantEval: function(){
            this.evaluationId = null;
            this.behaviorComment = '';
            this.moddingComment = '';
            this.vote = 0;
            $("input[name=vote]").prop("checked",false);
            
            if(this.discussApp){
                this.discussApp.evaluations.forEach(ev => {
                    if(ev.evaluator.id == this.evaluator){
                        this.evaluationId = ev.id;
                        this.behaviorComment = ev.behaviorComment;
                        this.moddingComment = ev.moddingComment;
                        this.vote = ev.vote;
                    }
                }); 
            }else{
                this.discussRound.evaluations.forEach(ev => {
                    if(ev.evaluator.id == this.evaluator){
                        this.evaluationId = ev.id;
                        this.behaviorComment = ev.behaviorComment;
                        this.moddingComment = ev.moddingComment;
                        this.vote = ev.vote;
                    }
                }); 
            }
        },
        findRelevantReports: function() {
            this.relevantReports = this.reports.filter( report => 
                report.culprit == this.discussRound.bn.id);
        },
        createDeadline: function(date){
            date = new Date(date);
            date = new Date(date.setDate (date.getDate() + 7)).toString().slice(4,10);
            return date;
        },
        modUrl: function(mod){
            if (mod.indexOf('https://osu.ppy.sh/beatmapsets/') == 0 && mod.indexOf("#") < 0) {
                mod = mod.slice(31);
                let indexEnd = mod.indexOf('/');
                return `https://osu.ppy.sh/beatmapsets/${mod.slice(0, indexEnd)}/discussion/timeline?user=${this.discussApp.applicant.osuId}`;
            }else{
                return mod;
            }
        },

        //action
        submitEval: async function (e) {
            const vote = $('input[name=vote]:checked').val();
            if(!vote || !this.behaviorComment.length || !this.moddingComment.length){
                this.info = 'Cannot leave fields blank!'
            }else{
                if(this.discussApp){
                    const a = await this.executePost(
                        '/qat/appEval/submitEval/' + this.discussApp.id, 
                        { evaluationId: this.evaluationId, 
                        vote: vote, 
                        behaviorComment: this.behaviorComment, 
                        moddingComment: this.moddingComment,
                        discussion: true
                        }, e);
                    if (a) {
                        await this.$emit('update-application', a);
                        if(this.evaluationId){
                            this.confirm = "Evaluation updated!"
                        }else{
                            this.confirm = "Evaluation submitted!"
                        }
                    }
                }else{
                    const er = await this.executePost(
                        '/qat/bnEval/submitEval/' + this.discussRound.id, 
                        { evaluationId: this.evaluationId, 
                        vote: vote, 
                        behaviorComment: this.behaviorComment, 
                        moddingComment: this.moddingComment,
                        discussion: true
                        }, e);
                    if (er) {
                        await this.$emit('update-eval-round', er);
                        if(this.evaluationId){
                            this.confirm = "Evaluation updated!"
                        }else{
                            this.confirm = "Evaluation submitted!"
                        }
                    }
                }
            }
        },
        setConsensus: async function(consensus, e){
            if(this.discussApp){
                const a = await this.executePost(
                    '/qat/appEval/setConsensus/' + this.discussApp.id, {consensus: consensus}, e);
                if (a) {
                    await this.$emit('update-application', a);
                }
            }else{
                const er = await this.executePost(
                    '/qat/bnEval/setConsensus/' + this.discussRound.id, {consensus: consensus}, e);
                if (er) {
                    await this.$emit('update-eval-round', er);
                }
            }
        }
    },
    data() {
        return {
            evaluationId: '',
            behaviorComment: '',
            moddingComment: '',
            vote: 0,
            relevantReports: [],
            info: '',
            confirm: ''
        };
    },
}
</script>

<style>


</style>