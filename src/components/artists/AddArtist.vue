<template>
    <modal-dialog id="addArtist" title="Add artist">
        <div class="container">
            <div class="form-group row">
                <label class="col-sm-3 mt-1" for="artistName"> Artist/Label:</label>
                <input
                    v-model="name"
                    class="col-sm-9 form-control"
                    style="border-radius: 100px 100px 100px 100px"
                    type="text"
                    @keyup.enter="createArtist($event)"
                >
            </div>

            <div class="radial-divisor" />

            <button type="button" class="btn btn-outline-info float-right" @click="createArtist($event)">
                Save
            </button>
        </div>
    </modal-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import ModalDialog from '@components/ModalDialog.vue';

export default Vue.extend({
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
            const artist = await this.executePost('/artists/create', { name: this.name }, e);

            if (!this.isError(artist)) {
                this.$store.commit('addArtist', artist);
                ($('#addArtist')).modal('hide');
            }
        },
    },
});
</script>
