<template>
    <div class="row">
        <div class="input-group col-sm-4">
            <input
                v-model.number="newCommunityVoteCount"
                class="form-control form-control-sm"
                autocomplete="off"
                type="number"
                placeholder="community vote count"
                @keyup.enter="updateCommunityVoteCount($event)"
            />
            <div class="input-group-append">
                <button
                    class="btn btn-primary"
                    href="#"
                    @click.prevent="updateCommunityVoteCount($event)"
                >
                    save
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'CommunityVoteCount',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        communityVoteCount: {
            type: Number,
            default: 5,
        },
    },
    data () {
        return {
            newCommunityVoteCount: this.communityVoteCount,
        };
    },
    watch: {
        contestId(): void {
            this.newCommunityVoteCount = this.communityVoteCount;
        },
    },
    methods: {
        async updateCommunityVoteCount(e): Promise<void> {
            const communityVoteCount = await this.$http.executePost(`/contests/listing/${this.contestId}/updateCommunityVoteCount`, { communityVoteCount: this.newCommunityVoteCount }, e);

            if (!this.$http.isError(communityVoteCount)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated community vote count to ${communityVoteCount}`,
                    type: 'info',
                });
                this.$store.commit('updateCommunityVoteCount', {
                    contestId: this.contestId,
                    communityVoteCount,
                });
            }
        },
    },
});
</script>
