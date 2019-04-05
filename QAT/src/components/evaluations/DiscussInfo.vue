<template>
<div id="discussionInfo" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content custom-bg-dark" v-if="application || discussRound">
            <div class="modal-header text-dark bg-qat-logo">
                <h5 class="modal-title">
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
                        <div v-if="discussRound" class="col-sm-12">
                            <p class="text-shadow">Nominations or osmething</p>

                            <h5 class="text-shadow mb-2">Consensus:
                                <span v-if="discussRound.consensus">{{discussRound.consensus}}</span>
                                <span v-else>none</span>
                            </h5>
                            <hr>
                        </div>
                        
                       
                            
                        <div class="col-sm-12 row text-shadow" v-for="evaluation in discussRound.evaluations" :key="evaluation.id">
                            <div class="col-sm-3">
                                <p :class=" evaluation.vote == 1 ? 'vote-pass' : evaluation.vote == 2 ? 'vote-extend' : 'vote-fail'">{{evaluation.evaluator.slice(0,18)}}</p> 
                            </div>
                            <div class="col-sm-9 small">
                                <p class="mb-1">Behavior: {{evaluation.behaviorComment}}</p> 
                                <p>Modding: {{evaluation.moddingComment}}</p>
                            </div>
                        
                        </div>

                        
                        
                        
                        <div class="col-sm-12">
                            <hr>
                            <p class="text-shadow">{{evaluationId ? 'Edit response:' : 'Add a response:'}}</p>
                        </div>
                        <div class="col-sm-6">
                            <p class="text-shadow">Behavior/attitude comments:</p>
                            <div class="form-group">
                                <textarea class="form-control dark-textarea" id="behaviorComments" rows="4" v-model="behaviorComment"></textarea>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <p class="text-shadow">Modding comments:</p>
                            <div class="form-group">
                                <textarea class="form-control dark-textarea" id="moddingComments" rows="4" v-model="moddingComment"></textarea>
                            </div>
                        </div>
                        <div class="col-sm-12 mb-2">
                            <span class="mr-3 text-shadow">Vote:</span>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="vote" id="1d" value="1" :checked="vote == 1">
                                <label class="form-check-label text-shadow vote-pass" for="1d">Pass</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="vote" id="2d" value="2" :checked="vote == 2">
                                <label class="form-check-label text-shadow vote-extend" for="2d">Extend</label>
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
            <div class="modal-footer" style="overflow: hidden;">
                <button class="btn btn-sm btn-qat" @click="submitEval($event)">Submit Evaluation</button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import mixin from "../../mixins.js";

export default {
    name: 'discuss-info',
    props: [ 'application', 'discuss-round', 'evaluator' ],
    mixins: [ mixin ],
    computed: {
        
    },
    watch: {
        application: function() {
            this.info = '';
            this.confirm = '';
            this.findRelevantEval();
        },
        discussRound: function() {
            this.info = '';
            this.confirm = '';
            this.findRelevantEval();
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

            this.discussRound.evaluations.forEach(ev => {
                if(ev.evaluator == this.evaluator){
                    this.evaluationId = ev.id;
                    this.behaviorComment = ev.behaviorComment;
                    this.moddingComment = ev.moddingComment;
                    this.vote = ev.vote;
                }
            }); 
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
                return `https://osu.ppy.sh/beatmapsets/${mod.slice(0, indexEnd)}/discussion/timeline?user=${this.application.applicant.osuId}`;
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
                if(this.application){
                    const a = await this.executePost(
                        '/qat/appEval/submitEval/' + this.application.id, 
                        { evaluationId: this.evaluationId, 
                        vote: vote, 
                        behaviorComment: this.behaviorComment, 
                        moddingComment: this.moddingComment
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
                        moddingComment: this.moddingComment
                        }, e);
                    if (er) {
                        await this.$emit('update-discuss-round', er);
                        if(this.evaluationId){
                            this.confirm = "Evaluation updated!"
                        }else{
                            this.confirm = "Evaluation submitted!"
                        }
                    }
                }
                
            }
		},
    },
    data() {
        return {
            evaluationId: '',
            behaviorComment: '',
            moddingComment: '',
            vote: 0,
            info: '',
            confirm: ''
        };
    },
}
</script>

<style>

</style>