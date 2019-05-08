<template>
<div id="addArtist" class="modal fade" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content custom-bg-dark">
            <div class="modal-header text-dark bg-done">
                <h5 class="modal-title" >Add artist</h5>
                <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
                </button>
            </div>
            <div class="modal-body" style="overflow: hidden">
                <img src="../../images/the_A.png" class="the-a-background">
                <div class="container">
                    <div class="form-group row">
                        <label class="col-sm-3 mt-1 text-shadow" for="artistName"> Artist/Label:</label><input class="col-sm-9 form-control" style="border-radius: 100px 100px 100px 100px" type="text" id="artistName" @keyup.enter="createArtist">
                    </div>
                    <hr>
                    <button type="button" class="btn btn-mg float-right" @click="createArtist($event)">Save</button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import mixin from "../../mixins.js";

export default {
    name: 'create-party',
    props: [ 'info' ],
    mixins: [ mixin ],
    methods: {
        executePost: async function (path, data, e) {
			if (e) e.target.disabled = true;

			try {
				const res = await axios.post(path, data)

				if (res.data.error) {
					this.$parent.info = res.data.error;
				} else {
					if (e) e.target.disabled = false;
					return res.data;
				}
			} catch (error) {
				console.log(error)
			}

			if (e) e.target.disabled = false;
		},
        createArtist: async function (e) {
            const name = $("#artistName").val();
            const artist = await this.executePost('/artists/create', { name: name }, e);
            if (artist) {
                this.$parent.allArtists.unshift(artist);
                $('#addArtist').modal('hide');
            }
		},
    },
}
</script>

<style>

</style>
