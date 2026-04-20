<template>
    <div class="form-inline w-100 mt-2">
        <div>Community vote description</div>
        <textarea
            v-model="newDescription"
            class="ml-1 form-control"
            placeholder="click outside the box to save..."
            maxlength="40000"
            rows="6"
            @change="updateCommunityVoteDescription($event)"
        />
        <small class="text-secondary">Click outside the text box to save. Supports <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank">markdown</a>. This text is shown to voters at the top of the voting page.</small>

        <template v-if="newDescription">
            <div class="mt-2">
                Preview description
            </div>
            <div>
                <div class="small bg-dark pt-3 pb-1 px-3 mb-2 rounded" v-html="$md.render(newDescription.trim())" />
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'CommunityVoteDescription',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        communityVoteDescription: {
            type: String,
            default: null,
        },
    },
    data () {
        return {
            newDescription: this.communityVoteDescription,
        };
    },
    watch: {
        contestId(): void {
            this.newDescription = this.communityVoteDescription;
        },
    },
    methods: {
        async updateCommunityVoteDescription(e): Promise<void> {
            const communityVoteDescription = await this.$http.executePost(`/contests/listing/${this.contestId}/updateCommunityVoteDescription`, { communityVoteDescription: this.newDescription }, e);

            if (!this.$http.isError(communityVoteDescription)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated community vote description`,
                    type: 'info',
                });
                this.$store.commit('updateCommunityVoteDescription', {
                    contestId: this.contestId,
                    communityVoteDescription,
                });
            }
        },
    },
});
</script>
