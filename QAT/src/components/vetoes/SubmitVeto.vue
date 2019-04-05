<template>
<div id="addVeto" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content custom-bg-dark">
            <div class="modal-header bg-done">
                <h5 class="modal-title text-dark">Submit a new veto</h5>
                <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
                </button>
            </div>
            <div class="modal-body" style="overflow: hidden">
                <div class="container">
                    <div class="row">
                        <input type="text" class="form-control" placeholder="Beatmap Link" v-model="beatmapLink">
                    </div>
                    <div class="row">
                        <input type="text" class="form-control" placeholder="Reason Link" v-model="reasonLink">
                    </div>

                    <div class="row">
                        <div class="form-check form-check-inline">
                            <input type="radio" name="osu" value="osu" v-model="mode">
                            <label for="osu"><i class="far fa-circle"></i></label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input type="radio" name="taiko" value="taiko" v-model="mode">
                            <label for="taiko"><i class="fas fa-drum"></i></label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input type="radio" name="catch" value="catch" v-model="mode">
                            <label for="mania"><i class="fas fa-apple-alt"></i></label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input type="radio" name="mania" value="mania" v-model="mode">
                            <label for="catch"><i class="fas fa-stream"></i></label>
                        </div>
                    </div>
                    <p class="errors text-shadow">{{ info }}</p>
                    <hr>
                    <button type="submit" class="btn btn-mg float-right" @click="submitVeto($event)">Submit</button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import mixin from '../../mixins.js'

export default {
    name: 'submit-veto',
    mixins: [ mixin ],
    data() {
        return {
            beatmapLink: null,
            reasonLink: null,
            mode: null,
            info: null,
        }
    },
    methods: {
        executePost: async function(path, data, e) {
			if (e) e.target.disabled = true;
            $("[data-toggle='tooltip']").tooltip('hide');
			try {
				const res = await axios.post(path, data)
				
				if (res.data.error) {
                    this.info = res.data.error;
				} else {
					if (e) e.target.disabled = false;
					return res.data;
				}
			} catch (error) {
                this.info = 'Something went wrong';
            }
            if (e) e.target.disabled = false;
        },
        submitVeto: async function (e) {
            if (!this.beatmapLink || !this.beatmapLink || !this.mode) {
                this.info = 'Fill the info';
            } else {
                const veto = await this.executePost('/qat/vetoes/submit', { 
                    beatmapLink: this.beatmapLink, 
                    reasonLink: this.reasonLink,
                    mode: this.mode,
                }, e);
                
                if (veto) {
                    $('#addVeto').modal('hide');
                    this.$parent.vetoes.push(veto);
                }
            }
        },
    }
}
</script>

<style>

</style>
