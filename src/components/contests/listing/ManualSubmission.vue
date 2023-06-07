<template>
    <div>
        <div class="input-group">
            <input
                v-model="usernameInput"
                type="text"
                class="form-control"
                placeholder="username..."
            />
            <input
                v-model="anonymizedNameInput"
                type="text"
                class="form-control"
                placeholder="anonymized name..."
            />
            <input
                v-model="urlInput"
                type="text"
                class="form-control"
                placeholder="url..."
                @keyup.enter="addSubmission($event)"
            />
            <div class="input-group-append">
                <button
                    class="btn btn-primary"
                    href="#"
                    @click="addSubmission($event)"
                >
                    Add submission <i class="fas fa-plus fa-xs" />
                </button>
            </div>
        </div>
        <small class="text-secondary">If you receive a late submission, you can manually add it to the list with this small form.</small>

        <hr />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ManualSubmission',
    props: {
        contestId: {
            type: String,
            required: true,
        },
    },
    data () {
        return {
            usernameInput: null,
            anonymizedNameInput: null,
            urlInput: null,
        };
    },
    methods: {
        async addSubmission(e): Promise<void> {
            const submission = await this.$http.executePost(`/contests/listing/${this.contestId}/manuallyAddSubmission`, { username: this.usernameInput, anonymizedName: this.anonymizedNameInput, url: this.urlInput }, e);

            if (!this.$http.isError(submission)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Added submission`,
                    type: 'info',
                });
                this.$store.commit('addSubmission', {
                    contestId: this.contestId,
                    submission,
                });
            }
        },
    },
});
</script>