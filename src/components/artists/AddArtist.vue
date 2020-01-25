<template>
    <div id="addArtist" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content bg-dark">
                <div class="modal-header text-dark bg-done">
                    <h5 class="modal-title">
                        Add artist
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <img src="../../images/the_A.png" class="the-a-background">
                    <div class="container">
                        <div class="form-group row">
                            <label class="col-sm-3 mt-1 text-shadow" for="artistName"> Artist/Label:</label>
                            <input
                                v-model="name"
                                class="col-sm-9 form-control"
                                style="border-radius: 100px 100px 100px 100px"
                                type="text"
                                @keyup.enter="createArtist($event)"
                            >
                        </div>

                        <div class="radial-divisor mx-auto my-3" />

                        <button type="button" class="btn btn-outline-info float-right" @click="createArtist($event)">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'AddArtist',
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
                ($('#addArtist') as any).modal('hide');
            }
        },
    },
});
</script>
