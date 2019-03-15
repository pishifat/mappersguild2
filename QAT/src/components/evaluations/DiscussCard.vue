<template>
<div class='col-md-2 my-2' @click="selectDiscussRound()" >
    <div class="card custom-bg-dark border-outline" :class="'border-' + findRelevantEval()" style="height: 100%" data-toggle='modal' data-target='#discussionInfo' :data-user="discussRound.id">
        <div class='card-body notification-card-spacing mx-1'>
            <div
                class="card-status"
                :class="'card-status-' + discussRound.consensus"
            ></div>
            <p class='card-text text-shadow'>
                <a @click.stop :href="'https://osu.ppy.sh/users/' + discussRound.bn.osuId" target="_blank">{{discussRound.bn.username}}</a> 
                <i v-if="discussRound.mode == 'osu'" class="far fa-circle"></i>
                <i v-else-if="discussRound.mode == 'taiko'" class="fas fa-drum"></i>
                <i v-else-if="discussRound.mode == 'catch'" class="fas fa-apple-alt"></i>
                <i v-else-if="discussRound.mode == 'mania'" class="fas fa-stream"></i>
            </p>
        </div>
        <div class="card-footer notification-card-spacing mx-2">
            <p class="badge-spacing">
                <span class="card-text text-shadow small">Votes:</span>
                <span v-if="pass" class="badge badge-primary badge-pass" data-toggle="tooltip" data-placement="top" title="pass">{{pass}}</span>
                <span v-if="neutral" class="badge badge-primary badge-neutral" data-toggle="tooltip" data-placement="top" title="neutral">{{neutral}}</span>
                <span v-if="extend" class="badge badge-primary badge-extend" data-toggle="tooltip" data-placement="top" title="extend">{{extend}}</span>
                <span v-if="fail" class="badge badge-primary badge-fail" data-toggle="tooltip" data-placement="top" title="fail">{{fail}}</span>
            </p>
            <p class='card-text text-shadow small'>
                Deadline: 
                <span class="errors">{{new Date(discussRound.deadline).toString().slice(4,10)}}</span>
            </p>
            
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'discuss-card',
    props: ['discuss-round', 'evaluator'],
    watch: {
        discussRound: function(v){
            this.addVotes();
        }
    },
    methods: {
        selectDiscussRound: function () {
            this.$emit('update:selectedDiscussRound', this.discussRound);
        },
        findRelevantEval: function(){
            let vote;
            this.discussRound.evaluations.forEach(ev => {
                if(ev.evaluator == this.evaluator){
                    if(ev.vote == 1){
                        vote = 'pass';
                    }else if(ev.vote == 2){
                        vote = this.application ? 'neutral' : 'extend'
                    }else{
                        vote = 'fail'
                    }
                }
            });
            return vote;
        },
        addVotes: function(){
            this.pass = 0;
            this.neutral = 0;
            this.extend = 0;
            this.fail = 0;
            this.discussRound.evaluations.forEach(ev => {
                if(ev.vote == 1){
                    this.pass++;
                }else if(ev.vote == 2){
                    this.extend++;
                }else if(ev.vote == 3){
                    this.fail++;
                }
            })
        }
    },
    data() {
        return {
            pass: 0,
            neutral: 0,
            extend: 0,
            fail: 0,
        };
    },
    created() {
        this.addVotes();
    },
}
</script>

<style>

.badge-spacing{
    padding: 0 0 0 0;
    margin: 0 0 0 0;
}

</style>
