<template>
    <modal-dialog id="addArtist" title="Add artist">
        <div class="container">
            <div class="mb-3 row">
                <label class="form-label col-sm-3 mt-1" for="artistName"> Artist/Label:</label>
                <input
                    v-model="name"
                    class="col-sm-9 form-control"
                    style="border-radius: 100px 100px 100px 100px"
                    type="text"
                    @keyup.enter="createArtist($event)"
                >
            </div>

            <div class="radial-divisor" />

            <button type="button" class="btn btn-outline-info float-end" @click="createArtist($event)">
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
        };
    },
    methods: {
        async createArtist (e): Promise<void> {
            const artist = await this.$http.executePost('/artists/create', { name: this.name }, e);

            if (!this.$http.isError(artist)) {
                this.$store.commit('addArtist', artist);
                this.$bs.hideModal('addArtist');
            }
        },
    },
});
</script>
