<template>
    <div class="">
        <a
            v-if="!showCommentInput"
            href="#"
            @click.prevent="showCommentInput = !showCommentInput"
        >
            <i class="fas fa-edit" />
        </a>

        <span v-if="!showCommentInput" class="small text-shadow text-white-50">{{ newComment || '...' }}</span>

        <template v-else>
            <textarea
                v-model.trim="newComment"
                class="form-control form-control-sm"
                rows="4"
                type="text"
                placeholder="enter to submit..."
                style="overflow: hidden; overflow-wrap: break-word;"
                maxlength="1000"
            />

            <div class="text-right">
                <button
                    type="button"
                    class="btn btn-sm btn-outline-info  mt-1"
                    @click="cancelUpdate()"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    class="btn btn-sm btn-outline-info  mt-1"
                    @click="updateComment($event)"
                >
                    Save
                </button>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'ScreeningNotes',
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
        cancelUpdate(): void {
            this.showCommentInput = !this.showCommentInput;
            this.newComment = this.savedComment;
        },
        async updateComment(e): Promise<void> {
            if (this.savedComment != this.newComment) {
                const submission = await this.executePost('/screening/updateSubmission/' + this.submissionId, { comment: this.newComment.trim() }, e);

                if (!this.isError(submission)) {
                    this.showCommentInput = !this.showCommentInput;
                    this.$store.commit('updateSubmission', submission);
                }
            } else {
                this.showCommentInput = !this.showCommentInput;
            }
        },
    },
});
</script>