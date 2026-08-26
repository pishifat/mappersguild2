<template>
    <modal-dialog id="addBackground" title="Submit a background">
        <div class="container">
            Information
            <div class="small text-secondary">
                By submitting your image to this page, <b>you permit it to be used in <a href="https://osu.ppy.sh/wiki/Community/Mappers_Guild" target="_blank">Mappers' Guild</a> osu! beatmaps</b>.
                <ul>
                    <li>
                        After submitting your image, it'll be manually reviewed based on this criteria:
                        <ul>
                            <li><b>You must own the rights to the image.</b></li>
                            <li><b>The image must be of reasonable quality.</b></li>
                            <li><b>The image must be appropriate for all ages.</b></li>
                        </ul>
                    </li>
                    <li>If approved, your image will appear in the listing on this page!</li>
                    <li>You can hide the image from the listing at any time, in case you change your mind about permitting it. This won't remove it from osu! beatmaps though.</li>
                </ul>
            </div>

            <div class="mb-2">
                Image
                <div class="small text-secondary mt-1">
                    This will upload the image to a third party image host (Cloudinary) and requires files under 1MB. If you'd rather not do this, submit a direct image URL (a link ending in .jpg or .png).
                </div>
                <input
                    ref="fileInput"
                    class="form-control form-control-sm"
                    type="file"
                    accept="image/*"
                    :disabled="Boolean(link)"
                    @change="onFileChange"
                />
            </div>
            <div class="mb-3">
                <input
                    v-model="link"
                    class="form-control form-control-sm"
                    type="text"
                    autocomplete="off"
                    placeholder="...or a direct image URL instead"
                    :disabled="Boolean(file)"
                />
            </div>

            <div class="mb-3">
                Name
                <div class="small text-secondary mt-1">
                    Choose a unique name for your image.
                </div>
                <input
                    v-model="name"
                    class="form-control form-control-sm"
                    type="text"
                    autocomplete="off"
                    placeholder="..."
                />
            </div>

            <div class="mb-3">
                Tags
                <div class="small text-secondary mt-1">
                    Comma separated tags for search. <small>(optional)</small>
                </div>
                <input
                    v-model="tags"
                    class="form-control form-control-sm"
                    type="text"
                    autocomplete="off"
                    placeholder="tag1, tag2, tag3..."
                />
            </div>
        </div>

        <button
            type="submit"
            class="btn btn-outline-success w-100"
            :disabled="isUploading"
            @click="submit($event)"
        >
            {{ isUploading ? 'Uploading...' : 'Submit background' }}
        </button>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalDialog from '@components/ModalDialog.vue';
import { Background } from '@interfaces/background';

export default defineComponent({
    name: 'AddBackgroundModal',
    components: {
        ModalDialog,
    },
    data () {
        return {
            name: '',
            file: null as File | null,
            link: '',
            tags: '',
            isUploading: false,
        };
    },
    methods: {
        onFileChange (e): void {
            this.file = e.target.files[0] || null;
        },
        async submit (e): Promise<void> {
            if (!this.name.trim() || (!this.file && !this.link.trim())) {
                this.$store.dispatch('updateToastMessages', {
                    message: 'Enter a name and choose an image (or a direct URL to one)!',
                    type: 'danger',
                });

                return;
            }

            const formData = new FormData();
            formData.append('name', this.name.trim());

            if (this.file) {
                formData.append('file', this.file);
            } else {
                formData.append('link', this.link.trim());
            }

            formData.append('tags', this.tags.trim());

            this.isUploading = true;
            const background = await this.$http.executePost<Background>('/backgrounds/create', formData, e);
            this.isUploading = false;

            if (!this.$http.isError(background)) {
                this.$bs.hideModal('addBackground');
                this.$store.commit('backgrounds/addBackground', background);
                this.name = '';
                this.file = null;
                this.link = '';
                this.tags = '';

                if (this.$refs.fileInput) {
                    (this.$refs.fileInput as HTMLInputElement).value = '';
                }
            }
        },
    },
});
</script>
