<template>
<div v-if="test">
    <p class="text-center">User: {{ test.applicant.username }} - Mode: {{ test.mode }}</p>

    <form action="" method="post">
        <div v-for="(answer, i) in test.answers" :key="answer.id">
            <h3>Q{{ ++i }}: {{ answer.question.content }} - {{ answer.question.category }}</h3>
            <div v-for="option in getActiveOptions(answer.question.options)" :key="option.id">
                <div class="form-check mb-2" v-if="answer.question.questionType === 'text' || answer.question.questionType === 'image'">
                    <input class="form-check-input" type="checkbox" value="">
                    <label class="form-check-label" v-if="answer.question.questionType === 'text'">
                        {{ option.content }}
                    </label>
                    <img :src="option.content" v-if="answer.question.questionType === 'image'">
                </div>
                <div class="mb-2" v-else>
                    <label>{{ option.content }}</label>
                    <input class="form-control" type="text" >
                </div>
            </div>
        </div>
        <hr>
        <button type="submit" class="btn btn-lg btn-qat">Submit</button>
    </form>
</div>
</template>

<script>
export default {
    name: 'test-submission-page',
    data() {
        return {
            test: null,
        };
    },
    methods: {
        // getCategories: function () {
        //     this.test.answers.filter(a => {
        //         a.question.category == 
        //     });
        // },
        getActiveOptions: function (options) {
            return options.filter(o => o.active);
        },
    },
    created() {
        axios
            .get('/qat/testSubmission/relevantInfo')
            .then(response => {
                this.test = response.data.test;
            })
            .then(function() {
                $('#loading').fadeOut();
                $('#main')
                    .attr('style', 'visibility: visible')
                    .hide()
                    .fadeIn();
            });
    },
};
</script>

<style>
</style>
