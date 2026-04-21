<template>
    <div class="form-inline w-100">
        Voting closes:
        <div class="input-group">
            <input
                v-model="newVoteEnd"
                class="ml-1 form-control"
                type="date"
                @keyup.enter="updateCommunityVoteEnd($event)"
            />
            <div class="input-group-append">
                <button
                    class="btn btn-primary"
                    href="#"
                    @click="updateCommunityVoteEnd($event)"
                >
                    Save date
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'CommunityVoteDates',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        communityVoteEnd: {
            type: String,
            default: null,
        },
    },
    data () {
        return {
            newVoteEnd: this.communityVoteEnd,
        };
    },
    watch: {
        contestId(): void {
            this.newVoteEnd = this.communityVoteEnd;
        },
    },
    methods: {
        async updateCommunityVoteEnd(e): Promise<void> {
            const communityVoteEnd = await this.$http.executePost(`/contests/listing/${this.contestId}/updateCommunityVoteEnd`, { date: this.newVoteEnd }, e);

            if (!this.$http.isError(communityVoteEnd)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated community vote end date`,
                    type: 'info',
                });
                this.$store.commit('updateCommunityVoteEnd', {
                    contestId: this.contestId,
                    communityVoteEnd,
                });
            } else {
                this.newVoteEnd = this.communityVoteEnd;
            }
        },
    },
});
</script>
