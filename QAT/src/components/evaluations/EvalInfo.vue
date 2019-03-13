<template>
<div id="evaluationInfo" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content custom-bg-dark" v-if="applicant">
            <div class="modal-header text-dark bg-qat">
                <h5 class="modal-title">
                    BN Evaluation: <a @click.stop :href="'https://osu.ppy.sh/users/' + applicant.osuId" class="text-dark" target="_blank">{{applicant.username}}</a>
                    <i v-if="applicant.mode == 'osu'" class="far fa-circle"></i>
                    <i v-else-if="applicant.mode == 'taiko'" class="fas fa-drum"></i>
                    <i v-else-if="applicant.mode == 'catch'" class="fas fa-apple-alt"></i>
                    <i v-else-if="applicant.mode == 'mania'" class="fas fa-stream"></i>
                </h5>
            </div>
            <div class="modal-body" style="overflow: hidden;">
                <div class="container">
                    <div class="row">
                        <div class="col-sm-12">
                            <p class="text-shadow">Submitted mods:</p>
                            <ul style="list-style-type: none;">
                                <li class="small text-shadow" v-for="(mod, i) in applicant.mods" :key="i">
                                    <a :href="modUrl(mod)" target="_blank">{{modUrl(mod)}}</a>
                                </li>
                            </ul>
                            <p class="text-shadow">Test results: <a href="#">20/20 <i class="fas fa-angle-right"></i></a></p>
                        </div>
                        <div class="col-sm-6">
                            <p class="text-shadow">Behavior/attitude comments:</p>
                            <div class="form-group">
                                <textarea class="form-control dark-textarea" id="behaviorComments" rows="4"></textarea>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <p class="text-shadow">Modding comments:</p>
                            <div class="form-group">
                                <textarea class="form-control dark-textarea" id="moddingComments" rows="4"></textarea>
                            </div>
                        </div>
                        <div class="col-sm-12">
                            <span class="mr-3 text-shadow">Vote:</span>
                            <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="mode" id="osu" value="osu" checked>
                            <label class="form-check-label text-shadow vote-pass" for="osu">Pass</label>
                            </div>
                            <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="mode" id="taiko" value="taiko">
                            <label class="form-check-label text-shadow vote-neutral" for="taiko">Neutral</label>
                            </div>
                            <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="mode" id="catch" value="catch">
                            <label class="form-check-label text-shadow vote-fail" for="catch">Fail</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer" style="overflow: hidden;">
                <button class="btn btn-sm btn-qat float-right" @click="submitEval($event)">Submit Evaluation</button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import mixin from "../../mixins.js";

export default {
    name: 'eval-info',
    props: [ 'applicant' ],
    mixins: [ mixin ],
    computed: {
        
    },
    methods: {
        //display
        createDeadline: function(date){
            date = new Date(date);
            date = new Date(date.setDate (date.getDate() + 7)).toString().slice(4,10);
            return date;
        },
        modUrl: function(mod){
            if (mod.indexOf('https://osu.ppy.sh/beatmapsets/') == 0 && mod.indexOf("#") < 0) {
                mod = mod.slice(31);
                let indexEnd = mod.indexOf('/');
                return `https://osu.ppy.sh/beatmapsets/${mod.slice(0, indexEnd)}/discussion/timeline?user=${this.applicant.osuId}`;
            }else{
                return mod;
            }
        }

        //action
        
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