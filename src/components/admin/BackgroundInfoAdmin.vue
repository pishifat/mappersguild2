<template>
    <modal-dialog id="editBackground" :loaded="Boolean(background)">
        <template #header>
            {{ background.name }}
        </template>

        <template #default>
            <div class="container text-center">
                <img
                    :src="background.link"
                    class="img-fluid rounded mb-3"
                    style="max-height: 400px;"
                    :alt="background.name"
                />
                <div class="mb-2">
                    submitted by <user-link :user="background.user" />
                </div>
                <div class="mb-3 small text-secondary">
                    <a :href="background.link" target="_blank">view full image</a>
                </div>

                <button
                    v-if="background.approved"
                    class="btn btn-sm w-100"
                    :class="background.hidden ? 'btn-outline-success' : 'btn-outline-danger'"
                    @click="toggleHidden($event)"
                >
                    {{ background.hidden ? 'Unhide' : 'Hide' }}
                </button>
                <div v-else-if="background.denied">
                    <div v-if="background.deniedReason" class="small text-secondary mb-2 text-start">
                        <!-- eslint-disable-next-line vue/no-v-html -->
                        <b>denial reason:</b> <span v-html="$md.renderInline(background.deniedReason.trim())" />
                    </div>
                    <button
                        class="btn btn-sm btn-outline-success w-100"
                        @click="toggleDenied($event)"
                    >
                        Un-deny
                    </button>
                </div>
                <div v-else>
                    <input
                        v-model="deniedReason"
                        class="form-control form-control-sm mb-2"
                        type="text"
                        autocomplete="off"
                        placeholder="denial reason (optional)..."
                    />
                    <div class="d-flex gap-2">
                        <button
                            class="btn btn-sm btn-outline-success w-100"
                            @click="approve($event)"
                        >
                            Approve
                        </button>
                        <button
                            class="btn btn-sm btn-outline-danger w-100"
                            @click="toggleDenied($event)"
                        >
                            Deny
                        </button>
                    </div>
                </div>

                <button
                    class="btn btn-sm btn-danger w-100 mt-2"
                    @click="deleteBackground($event)"
                >
                    Delete
                </button>

                <hr />

                <input
                    v-model="newCreator"
                    class="form-control form-control-sm"
                    type="text"
                    autocomplete="off"
                    placeholder="new creator username/osuId..."
                    @keyup.enter="updateUser($event)"
                />

                <div class="mt-3">
                    <div class="small text-secondary mb-1 text-start">
                        <b>tags:</b> {{ background.tags && background.tags.length ? background.tags.join(', ') : 'none' }}
                    </div>
                    <div class="input-group input-group-sm">
                        <input
                            v-model="tagsInput"
                            class="form-control form-control-sm"
                            type="text"
                            autocomplete="off"
                            placeholder="comma separated tags..."
                            @keyup.enter="updateTags($event)"
                        />
                        <button class="btn btn-sm btn-outline-info" @click="updateTags($event)">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalDialog from '@components/ModalDialog.vue';
import { Background } from '@interfaces/background';

export default defineComponent({
    name: 'BackgroundInfoAdmin',
    components: {
        ModalDialog,
    },
    props: {
        background: {
            type: Object as () => Background,
            default: null,
        },
    },
    emits: ['update-background', 'delete-background'],
    data () {
        return {
            newCreator: '',
            tagsInput: '',
            deniedReason: '',
        };
    },
    watch: {
        background (): void {
            this.newCreator = '';
            this.tagsInput = this.background?.tags?.join(', ') || '';
            this.deniedReason = this.background?.deniedReason || '';
        },
    },
    methods: {
        async approve (e): Promise<void> {
            const background = await this.$http.executePost<Background>(`/admin/backgrounds/${this.background.id}/approve`, {}, e);

            if (!this.$http.isError(background)) {
                this.$store.dispatch('updateToastMessages', {
                    message: 'approved background',
                    type: 'info',
                });
                this.$emit('update-background', background);
            }
        },
        async toggleHidden (e): Promise<void> {
            const background = await this.$http.executePost<Background>(`/admin/backgrounds/${this.background.id}/toggleHidden`, {}, e);

            if (!this.$http.isError(background)) {
                this.$store.dispatch('updateToastMessages', {
                    message: 'updated hidden state',
                    type: 'info',
                });
                this.$emit('update-background', background);
            }
        },
        async toggleDenied (e): Promise<void> {
            const background = await this.$http.executePost<Background>(`/admin/backgrounds/${this.background.id}/toggleDenied`, { reason: this.deniedReason }, e);

            if (!this.$http.isError(background)) {
                this.$store.dispatch('updateToastMessages', {
                    message: 'updated denied state',
                    type: 'info',
                });
                this.$emit('update-background', background);
            }
        },
        async deleteBackground (e): Promise<void> {
            const result = confirm('Are you sure? This cannot be undone.');

            if (!result) return;

            const res = await this.$http.executePost(`/admin/backgrounds/${this.background.id}/delete`, {}, e);

            if (!this.$http.isError(res)) {
                this.$store.dispatch('updateToastMessages', {
                    message: 'deleted background',
                    type: 'info',
                });
                this.$emit('delete-background', this.background.id);
                this.$bs.hideModal('editBackground');
            }
        },
        async updateUser (e): Promise<void> {
            if (!this.newCreator.trim()) return;

            const background = await this.$http.executePost<Background>(`/admin/backgrounds/${this.background.id}/updateUser`, { user: this.newCreator.trim() }, e);

            if (!this.$http.isError(background)) {
                this.$store.dispatch('updateToastMessages', {
                    message: 'updated creator',
                    type: 'info',
                });
                this.newCreator = '';
                this.$emit('update-background', background);
            }
        },
        async updateTags (e): Promise<void> {
            const background = await this.$http.executePost<Background>(`/admin/backgrounds/${this.background.id}/updateTags`, { tags: this.tagsInput }, e);

            if (!this.$http.isError(background)) {
                this.$store.dispatch('updateToastMessages', {
                    message: 'updated tags',
                    type: 'info',
                });
                this.$emit('update-background', background);
            }
        },
    },
});
</script>
