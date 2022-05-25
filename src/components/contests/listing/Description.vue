<template>
    <div class="form-inline w-100 mt-2">
        Contest description:
        <textarea
            v-model="newDescription"
            length="4"
            class="ml-1 form-control"
            placeholder="click outside the box to save..."
            maxlength="40000"
            rows="6"
            @change="updateDescription($event)"
        />
        <small class="text-secondary">Click outside the text box to save. Also, this section supports <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank">markdown</a>!</small>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Description',
    props: {
        contestId: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: null,
        },
    },
    data () {
        return {
            newDescription: this.description,
        };
    },
    watch: {
        contestId(): void {
            this.newDescription = this.description;
        },
    },
    methods: {
        async updateDescription(e): Promise<void> {
            const description = await this.$http.executePost(`/contests/listing/${this.contestId}/updateDescription`, { description: this.newDescription }, e);

            if (!this.$http.isError(description)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated contest description`,
                    type: 'info',
                });
                this.$store.commit('updateDescription', {
                    contestId: this.contestId,
                    description,
                });
            }
        },
    },
});
</script>