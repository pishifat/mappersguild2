<template>
    <div class="form-check mt-2">
        <input
            id="communityVoteOrderedPriority"
            :checked="communityVoteOrderedPriority"
            class="form-check-input"
            type="checkbox"
            @change="toggleCommunityVoteOrderedPriority($event)"
        />
        <label class="form-check-label" for="communityVoteOrderedPriority">
            Ordered priority
        </label>
        <div class="small text-secondary">
            When enabled, voters rank their picks in order. Their top pick receives the most points, with each subsequent pick receiving one fewer point.
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'CommunityVoteOrderedPriorityToggle',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        communityVoteOrderedPriority: {
            type: Boolean,
            required: true,
        },
    },
    methods: {
        async toggleCommunityVoteOrderedPriority(e): Promise<void> {
            const confirmed = confirm('Changing this setting will delete all existing community votes. Are you sure?');

            if (!confirmed) {
                e.target.checked = this.communityVoteOrderedPriority;
                return;
            }

            const communityVoteOrderedPriority = await this.$http.executePost(`/contests/listing/${this.contestId}/toggleCommunityVoteOrderedPriority`, {}, e);

            if (!this.$http.isError(communityVoteOrderedPriority)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Toggled ordered priority`,
                    type: 'info',
                });
                this.$store.commit('updateCommunityVoteOrderedPriority', {
                    contestId: this.contestId,
                    communityVoteOrderedPriority,
                });
            }
        },
    },
});
</script>
