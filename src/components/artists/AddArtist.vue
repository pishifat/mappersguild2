<template>
    <modal-dialog id="addArtist" title="Add artist">
        <div class="container">
            <div class="mb-3 row">
                <input
                    v-model="name"
                    placeholder="artist/label"
                    class="col-sm-9 form-control"
                    style="border-radius: 100px 100px 100px 100px"
                    type="text"
                    @keyup.enter="createArtist($event)"
                />
                <input
                    v-model="comment"
                    placeholder="comment"
                    class="col-sm-9 form-control mt-2"
                    style="border-radius: 100px 100px 100px 100px"
                    type="text"
                    @keyup.enter="createArtist($event)"
                />
                <div class="form-check mt-2">
                    <input
                        id="isContacted"
                        v-model="isContacted"
                        :checked="isContacted"
                        class="form-check-input"
                        type="checkbox"
                    />
                    <label class="form-check-label" for="isContacted">
                        contacted?
                    </label>
                </div>
                <div class="form-check mt-2">
                    <input
                        id="isResponded"
                        v-model="isResponded"
                        :checked="isResponded"
                        class="form-check-input"
                        type="checkbox"
                    />
                    <label class="form-check-label" for="isResponded">
                        responded?
                    </label>
                </div>
            </div>

            <button type="button" class="btn btn-outline-info w-100" @click="createArtist($event)">
                Save
            </button>
        </div>
    </modal-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalDialog from '@components/ModalDialog.vue';

export default defineComponent({
    name: 'AddArtist',
    components: {
        ModalDialog,
    },
    data () {
        return {
            name: '',
            comment: '',
            isContacted: true,
            isResponded: false,
        };
    },
    methods: {
        async createArtist (e): Promise<void> {
            const artist = await this.$http.executePost('/artists/create', { name: this.name, comment: this.comment, isContacted: this.isContacted, isResponded: this.isResponded }, e);

            if (!this.$http.isError(artist)) {
                this.$store.commit('addArtist', artist);
                this.$bs.hideModal('addArtist');

            }
        },
    },
});
</script>
