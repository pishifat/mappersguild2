<template>
<div id="addEvalRounds" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content custom-bg-dark">
            <div class="modal-header bg-qat-logo">
                <h5 class="modal-title text-dark">Add BNs to evaluate</h5>
                <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
                </button>
            </div>
            <div class="modal-body" style="overflow: hidden">
                <div class="container">
                    <div class="form-check form-check-inline text-shadow">
                        <input class="form-check-input" type="checkbox" id="osu" value="osu">
                        <label class="form-check-label" for="osu">osu!</label>
                    </div>
                    <div class="form-check form-check-inline text-shadow">
                        <input class="form-check-input" type="checkbox" id="taiko" value="taiko">
                        <label class="form-check-label" for="taiko">osu!taiko</label>
                    </div>
                    <div class="form-check form-check-inline text-shadow">
                        <input class="form-check-input" type="checkbox" id="catch" value="catch">
                        <label class="form-check-label" for="catch">osu!catch</label>
                    </div>
                    <div class="form-check form-check-inline text-shadow">
                        <input class="form-check-input" type="checkbox" id="mania" value="mania">
                        <label class="form-check-label" for="mania">osu!mania</label>
                    </div>

                    <hr>
                        
                    <div class="form-check text-shadow mb-2">
                        <input class="form-check-input" type="checkbox" value="" id="probationBns">
                        <label class="form-check-label" for="probationBns">
                            Probation BNs
                        </label>
                    </div>
                    <div class="form-check text-shadow mb-2">
                        <input class="form-check-input" type="checkbox" value="" id="fullBns">
                        <label class="form-check-label" for="fullBns">
                            Full BNs
                        </label>
                    </div>
                    <div class="form-check text-shadow mb-2">
                        <input class="form-check-input" type="checkbox" value="" id="qat">
                        <label class="form-check-label" for="qat">
                            QAT
                        </label>
                    </div>

                    <hr>

                    <div class="mb-2"><span class="text-shadow">Include specific user(s):</span> 
                        <input id="includeUsers" type="text" placeholder="username1, username2, username3..." style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000); width: 500px;" /> 
                    </div>
                    <div class="mb-2"><span class="text-shadow">Exclude specific user(s):</span> 
                        <input id="excludeUsers" type="text" placeholder="username1, username2, username3..." style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000); width: 500px;" /> 
                    </div>

                    <hr>

                    <div class="mb-2"><span class="text-shadow">Deadline:</span> 
                        <input id="month" type="text" placeholder="MM" maxlength="2" style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000); width: 35px;"/> 
                        <input id="day" type="text" placeholder="DD" maxlength="2" style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000); width: 35px;"/> 
                    </div>
                </div>
                
                <hr>
                <span class="errors text-shadow" id="addEvalRoundsErrors">{{ info }}</span>
                <span class="confirm text-shadow" id="addEvalRoundsConfirm">{{ confirm }}</span>
                <button type="submit" class="btn btn-mg float-right" @click="addEvalRounds($event)">Add BNs</button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import mixin from '../../mixins.js'

export default {
    name: 'add-eval-rounds',
    mixins: [ mixin ],
    props: [],
    methods: {
        executePost: async function(path, data, e) {
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
                this.info = 'Something went wrong';
            }
            if (e) e.target.disabled = false;
        },
        addEvalRounds: async function (e) {
            this.info = '';
            this.confirm = '';

            let osu = $('#osu').is(':checked');
            let taiko = $('#taiko').is(':checked');
            let ctb = $('#catch').is(':checked');
            let mania = $('#mania').is(':checked');
            if(!osu && !taiko && !ctb && !mania){
                this.info = "Must select game mode!"
                return;
            }

            let probation = $('#probationBns').is(':checked');
            let bn = $('#fullBns').is(':checked');
            let qat = $('#qat').is(':checked');
            
            let includeUsers = $('#includeUsers').val();
            let excludeUsers = $('#excludeUsers').val();

            if(!probation && !bn && !qat && !includeUsers){
                this.info = "Must select user type!"
                return;
            }

            let y = new Date().getFullYear();
            let m = $('#month').val();
            let d = $('#day').val();
            let deadline = new Date(y + ", " + m + ", " + d);
            if(!(deadline instanceof Date) || isNaN(deadline)){
                this.info = "Invalid Date!"
                return;
            }

            const result = await this.executePost('/qat/bnEval/addEvalRounds/', {
                osu: osu, taiko: taiko, catch: ctb, mania: mania,
                probation: probation, bn: bn, qat: qat,
                includeUsers: includeUsers, excludeUsers: excludeUsers, deadline: deadline
                }, e);
            if (result.evalRounds) {
                this.$parent.evalRounds = result.evalRounds;
                this.confirm = 'Eval rounds added! ';
                if(result.failed.length){
                    this.confirm += 'However, the following usernames could not be processed: '
                    for (let i = 0; i < result.failed.length; i++) {
                        this.confirm += result.failed[i]
                        if((i + 1) != result.failed.length){
                            this.confirm += ", "
                        }
                    }
                }
            }
        },
    },
    data() {
        return {
            info: '',
            confirm: ''
        };
    },
}
</script>

<style>

</style>
