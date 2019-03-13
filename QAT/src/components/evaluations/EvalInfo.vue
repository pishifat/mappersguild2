<template>
<div id="evaluationInfo" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content custom-bg-dark" v-if="application">
            <div class="modal-header text-dark bg-qat">
                <h5 class="modal-title">
                    BN Evaluation: <a @click.stop :href="'https://osu.ppy.sh/users/' + application.applicant.osuId" class="text-dark" target="_blank">{{application.applicant.username}}</a>
                    <i v-if="application.mode == 'osu'" class="far fa-circle"></i>
                    <i v-else-if="application.mode == 'taiko'" class="fas fa-drum"></i>
                    <i v-else-if="application.mode == 'catch'" class="fas fa-apple-alt"></i>
                    <i v-else-if="application.mode == 'mania'" class="fas fa-stream"></i>
                </h5>
            </div>
            <div class="modal-body" style="overflow: hidden;">
                <div class="container">
                    <div class="row">
                        <div class="col-sm-12">
                            <p class="text-shadow">Submitted mods:</p>
                            <ul style="list-style-type: none;">
                                <li class="small text-shadow" v-for="(mod, i) in application.mods" :key="i">
                                    <a :href="modUrl(mod)" target="_blank">{{modUrl(mod)}}</a>
                                </li>
                            </ul>
                            <p class="text-shadow">Test results: <a href="#">20/20 <i class="fas fa-angle-right"></i></a></p>
                            <hr>
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
                            <input class="form-check-input" type="radio" name="vote" id="1" value="1">
                            <label class="form-check-label text-shadow vote-pass" for="1">Pass</label>
                            </div>
                            <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="vote" id="2" value="2">
                            <label class="form-check-label text-shadow vote-neutral" for="2">Neutral</label>
                            </div>
                            <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="vote" id="3" value="3">
                            <label class="form-check-label text-shadow vote-fail" for="3">Fail</label>
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
    name: 'eval-info',
    props: [ 'application', 'evaluator' ],
    mixins: [ mixin ],
    computed: {
        
    },
    watch: {
        application: function() {
            this.info = '';
            this.behaviorComment = '';
            this.moddingComment = '';
            this.findRelevantEval();
            this.confirm = '';
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
            this.application.evaluations.forEach(ev => {
                this.evaluation = ev;
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
        findEvaluation: function(evaluations){
            evaluations.forEach(ev => {
                if(ev.evaluator == evaluator){
                    this.evaluation = ev;
                }
            })
        },

        //action
        submitEval: async function (e) {
            const vote = $('input[name=vote]:checked').val();
            if(!vote || !this.behaviorComment.length || !this.moddingComment.length){
                this.info = 'Cannot leave fields blank!'
            }else{
                const a = await this.executePost(
                    '/qat/appEval/submitEval/' + this.application.id, 
                    { vote: vote, 
                    behaviorComment: this.behaviorComment, 
                    moddingComment: this.moddingComment
                    }, e);
                if (a) {
                    this.$emit('update-application', a);
                    if(this.evaluation){
                        this.confirm = "Evaluation updated!"
                    }else{
                        this.confirm = "Evaluation submitted!"
                    }
                    this.evaluation = a.evaluation; 
                }
            }
		},
    },
    data() {
        return {
            behaviorComment: '',
            moddingComment: '',
            evaluation: null,
            info: '',
            confirm: ''
        };
    },
}
</script>

<style>

.dark-textarea,
.dark-textarea:focus {
    background-color: #333;
    color: white;
    border-color: #222;
    filter: drop-shadow(1px 1px 1px #000000);
    font-size:10pt;
}

.vote-pass {
    color: #c1ffd2;
}

.vote-neutral {
    color: #c1daff;
}

.vote-extend {
    color: #fffbc1;
}

.vote-fail {
    color: #ffc4c4;
}

</style>