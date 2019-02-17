<template>
<div id="addBeatmap" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content custom-bg-dark">
            <div class="modal-header bg-done">
                <h5 class="modal-title text-dark">Add Beatmap</h5>
                <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
                </button>
            </div>
            <div class="modal-body" style="overflow: hidden">
                <img src="../../images/the_A.png" class="the-a-background">
                <div class="container">
                    <div class="form-group row">
                        <div class="col-lg-1">
                            <p class="text-shadow" style="margin-top: 3px;">Artist:</p>
                        </div>
                        <div class="col-lg-11">
                            <div class="input-group input-group-sm mb-3" style="width: 400px" id="artistForm">
                                <select class="custom-select select-arrow small" id="artistSelection">
                                    <option v-for="featuredArtist in featuredArtists" :value="featuredArtist.id">{{featuredArtist.label}}</option>
                                </select>
                                <div class="input-group-append">
                                    <button style="border-radius: 0 100px 100px 0;" class="rounded-circle-left btn btn-mg" id="artistButton" @click="setArtist($event);">Load songs</button>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-1">
                            <p class="text-shadow" style="margin-top: 3px;">Song:</p>
                        </div>
                        <div class="col-lg-11">
                            <div class="input-group input-group-sm mb-3" style="width: 400px" id="songForm">
                                <select class="custom-select select-arrow small" :disabled="!featuredSongs" id="songSelection" style="border-radius: 100px 100px 100px 100px">
                                    <option v-if="!featuredSongs">Select an artist to view songs</option>
                                    <option v-for="featuredSong in featuredSongs" :value="featuredSong.id">{{featuredSong.title}} --- ({{featuredSong.artist}})</option>
                                </select>
                            </div>
                        </div>
                        
                    </div>
                    <p class="text-shadow">Select one or more difficulties <i>you plan on mapping</i>. These can be changed later:</p>
                    <div class="form-group row">
                        <div class="col-sm-10">
                            <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="Easy">
                            <label class="form-check-label text-shadow" for="Easy">
                                Easy
                            </label>
                            </div>
                            <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="Normal">
                            <label class="form-check-label text-shadow" for="Normal">
                                Normal
                            </label>
                            </div>
                            <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="Hard">
                            <label class="form-check-label text-shadow" for="Hard">
                                Hard
                            </label>
                            </div>
                            <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="Insane">
                            <label class="form-check-label text-shadow" for="Insane">
                                Insane
                            </label>
                            </div>
                            <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="Expert">
                            <label class="form-check-label text-shadow" for="Expert">
                                Expert
                            </label>
                            </div>
                        </div>
                    </div>
                    
                    <p class="text-shadow">Select one or more difficulties <i>you don't want anyone else to claim</i>. These can be changed later: <br><small class="text-shadow">For example, if you don't want any guest difficulties, you should mark everything</small></p>
                    <div class="form-group row">
                        <div class="col-sm-10">
                            <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="lock-Easy">
                            <label class="form-check-label text-shadow" for="lock-Easy">
                                Easy
                            </label>
                            </div>
                            <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="lock-Normal">
                            <label class="form-check-label text-shadow" for="lock-Normal">
                                Normal
                            </label>
                            </div>
                            <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="lock-Hard">
                            <label class="form-check-label text-shadow" for="lock-Hard">
                                Hard
                            </label>
                            </div>
                            <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="lock-Insane">
                            <label class="form-check-label text-shadow" for="lock-Insane">
                                Insane
                            </label>
                            </div>
                            <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="lock-Expert">
                            <label class="form-check-label text-shadow" for="lock-Expert">
                                Expert
                            </label>
                            </div>
                        </div>
                    </div>
                </div>
                <p class="errors" id="addBeatmapErrors">{{ info }}</p>
                <hr>
                <button type="submit" class="btn btn-mg float-right" @click="saveNewMap($event)">Save</button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import mixin from '../../mixins.js'

export default {
    name: 'create-beatmap',
    mixins: [ mixin ],
    props: [ 'opened' ],
    watch: {
        opened: function (wasOpened) {
            if (wasOpened) {
                this.info = null;
                this.resetArtist();
                this.opened = false;
            }
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
			    if (e) e.target.disabled = false;
			}
        },
        resetArtist: function(){
            this.featuredSongs = null;
            axios
                .get('/beatmaps/artists')
                .then(response => {
                    this.featuredArtists = response.data.sort((a,b) => (a.label.toLowerCase() > b.label.toLowerCase()) ? 1 : ((b.label.toLowerCase() > a.label.toLowerCase()) ? -1 : 0));
                });
            this.info = null;
            $('input[type=checkbox]').each(function() 
            { 
                this.checked = false; 
            });
        },
        setArtist: async function(e){
            let labelId = $("#artistSelection").val();
            e.target.disabled = true;
            axios
                .get('beatmaps/songs/' + labelId)
                .then(response => {
                    console.log(response);
                    
                    e.target.disabled = false;
                    this.featuredSongs = response.data.sort((a,b) => (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : ((b.title.toLowerCase() > a.title.toLowerCase()) ? -1 : 0));
                });
        },
        saveNewMap: async function (e) {
            const song = $('#songSelection').val();
            if (song == "none") {
                this.info = "Select a song!"
            } else {
                const tasks = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert'];
                const difficulties = this.applyCheckboxes(tasks, false);
                const locks = this.applyCheckboxes(tasks, true); 
                const bm = await this.executePost('/beatmaps/create/', { song: song, tasks: difficulties, tasksLocked: locks }, e);
                if (bm && bm.error) {
                    this.info = res.data.error;
                } else if (bm) {
                    $('#addBeatmap').modal('hide');
                    $('.quest-collapse-wip').collapse();
                    $('#othersWip').collapse("show");
                    this.$parent.beatmaps.unshift(bm);
                }
            }
        },
        applyCheckboxes(tasks, isLocks) {
            let difficulties = '';
        
            tasks.forEach(function(task) {
                let element;
        
                if (isLocks) {
                    element = `#lock-${task}`;
                } else {
                    element = `#${task}`;
                }
        
                if ($(element).is(':checked')) {
                    difficulties += `${task}|`;
                }
            });
            return difficulties.slice(0, -1);
        },
    },
    data () {
		return { 
            //opened: false,
            info: null,
            featuredArtists: null,
            featuredSongs: null,
		}
    },
}
</script>

<style>

</style>
