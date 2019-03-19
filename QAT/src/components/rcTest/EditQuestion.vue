<template>
<div id="editQuestion" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content" v-if="question">
            <div class="modal-header bg-qat-logo">
                <h5 class="modal-title text-dark">Edit "{{category}}" question</h5>
                <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
                </button>
            </div>
            <div class="modal-body" style="overflow: hidden">
                <div class="container mb-2">
                    <div class="text-shadow mb-2"><p>Question:</p>
                        <div class="form-check form-check-inline ml-2">
                            <input class="form-check-input" type="radio" name="questionTypeEdit" id="textEdit" value="text" :checked="question.questionType == 'text'">
                            <label class="form-check-label text-shadow" for="textEdit">Select text</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="questionTypeEdit" id="imageEdit" value="image" :checked="question.questionType == 'image'">
                            <label class="form-check-label text-shadow" for="imageEdit">Select Image</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="questionTypeEdit" id="fillEdit" value="fill" :checked="question.questionType == 'fill'">
                            <label class="form-check-label text-shadow" for="fillEdit">Fill in blank</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <textarea class="form-control dark-textarea" id="newQuestionEdit" placeholder="avoid confusing wording..." maxlength="200" rows="2" v-model="question.content" @keyup.enter="addQuestion($event)"></textarea>
                    </div>
                    <button type="submit" class="btn btn-qat float-right" @click="updateQuestion($event)">Update Question</button>
                </div>
                <br class="mb-2">
                <hr>
                <div class="container">
                    <p class="text-shadow">Options:</p>
                    <div class="row col-md-12">
                        <input id="option" class="form-control-sm text-input col-md-10 mb-2" type="text" maxlength="100" placeholder="potential answer... (if image, post link)" />
                        <input id="score" class="form-control-sm text-input col-md-1 ml-1 mb-2" type="text" maxlength="5" placeholder="points..." style="min-width: 80px; width: 80;"/>
                    </div>
                </div>
                <hr>
                <span class="errors text-shadow" id="addEvalRoundsErrors">{{ info }}</span>
                <span class="confirm text-shadow" id="addEvalRoundsConfirm">{{ confirm }}</span>
                <button type="submit" class="btn btn-qat float-right" @click="addOption($event)">Add Option</button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import postData from '../../mixins/postData.js'

export default {
    name: 'edit-question',
    mixins: [ postData ],
    props: ['question', 'category'],
    methods: {
        updateQuestion: async function (e) {
            this.info = '';
            this.confirm = '';
            let questionType = $('input[name=questionTypeEdit]:checked').val();
            let newQuestion = $('#newQuestionEdit').val();
            if(!newQuestion || !newQuestion.length || !questionType || !questionType.length){
                this.info = "Cannot leave question fields blank!"
            }else{
                const question = await this.executePost('/qat/manageTest/updateQuestion/' + this.question.id, {questionType: questionType, newQuestion: newQuestion}, e);
                if (question) {
                    if (question.error) {
                        this.info = question.error;
                    } else {
                        this.$emit('update-question', question);
                        this.confirm = 'Question updated! ';
                    }
                }
            }
        },
        addOption: async function(e) {
            let option = $('#option').val();
            let score = $('#score').val();
            if(!option || !option.length || !score || !score.length){
                this.info = "Cannot leave option fields blank!"
            }else{
                const question = await this.executePost('/qat/manageTest/addOption/' + this.question.id, {option: option, score: score}, e);
                if (question) {
                    if (question.error) {
                        this.info = question.error;
                    } else {
                        this.$emit('update-question', question);
                        this.confirm = 'Question updated! ';
                    }
                }
            }
        }
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
