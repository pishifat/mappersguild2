<template>
    <div class="min-spacing mb-1 ml-2">
        <a href="#" @click.prevent="updateComment()">
            <i class="fas fa-edit" />
        </a>

        <span v-if="!showCommentInput" class="small text-shadow min-spacing text-white-50">{{ newComment || '...' }}</span>

        <input
            v-if="showCommentInput"
            v-model="newComment"
            class="custom-input small w-75"
            rows="4"
            type="text"
            placeholder="enter to submit..."
            style="border-radius: 5px 5px 5px 5px;"
            maxlength="1000"
            @keyup.enter="updateComment($event)"
            @change="updateComment($event)"
        >
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'JudgingNotes',
    props: {
        submissionId: {
            type: String,
            required: true,
        },
        savedComment: {
            type: String,
            default: '',
        },
    },
    data () {
        return {
            showCommentInput: false,
            newComment: this.savedComment,
        };
    },
    methods: {
        async updateComment(e): Promise<void> {
            if (!e) {
                this.showCommentInput = !this.showCommentInput;
            }

            if (this.savedComment != this.newComment) {
                this.showCommentInput = !this.showCommentInput;
                const submission = await this.executePost('/judging/updateSubmission/' + this.submissionId, { comment: this.newComment.trim() }, e);

                if (!this.isError(submission)) {
                    this.$store.commit('updateSubmission', submission);
                }
            }
        },
    },
});
</script>