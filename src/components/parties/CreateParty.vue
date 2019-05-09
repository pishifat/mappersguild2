<template>
<div id="createParty" class="modal fade" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content bg-dark">
            <div class="modal-header text-dark bg-done">
                <h5 class="modal-title" >Create party</h5>
                <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
                </button>
            </div>
            <div class="modal-body" style="overflow: hidden">
                <img src="../../images/the_A.png" class="the-a-background">
                <div class="container">
                    <div class="form-group row">
                        <label class="col-sm-4" for="partyName"> Party name:</label><input class="col-sm-8 form-control" style="border-radius: 100px 100px 100px 100px" type="text" id="partyName" @keyup.enter="createParty">
                    </div>

                    <p class="text-shadow">Primary game-mode:</p>
                    <div class="form-group row">
                        <div class="col-sm-12">
                            <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="mode" id="osu" value="osu" checked>
                            <label class="form-check-label text-shadow" for="osu">osu!</label>
                            </div>
                            <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="mode" id="taiko" value="taiko">
                            <label class="form-check-label text-shadow" for="taiko">osu!taiko</label>
                            </div>
                            <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="mode" id="catch" value="catch">
                            <label class="form-check-label text-shadow" for="catch">osu!catch</label>
                            </div>
                            <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="mode" id="mania" value="mania">
                            <label class="form-check-label text-shadow" for="mania">osu!mania</label>
                            </div>
                        </div>
                    </div>

                    <p class="mt-4 text-shadow errors">{{ info }}</p>
                    <hr>
                    <button type="button" class="btn btn-mg float-right" @click="createParty($event)">Save</button>
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
        createParty: async function (e) {
            const name = $("#partyName").val();
            const mode = $('input[name=mode]:checked').val();
			if (name.length < 3 || name.length > 32) {
				this.$parent.info = `Party name must be between 3 and 32 characters! Yours is ${name.length} ${name.length == 1 ? 'character' : 'characters'}`;
			} else {
				const party = await this.executePost('/parties/create', { name: name, mode: mode }, e);
				if (party) {
					this.$parent.userPartyId = party.id;
					this.$parent.parties.unshift(party);
					$('#createParty').modal('hide');
				}
			}
		},
    },
}
</script>

<style>

</style>
