<template>
<div>
	<div class="container bg-container py-3 mb-2">
		<div>
        <div class="row mb-2">
            <div class="col">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <div class="input-group-text">
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                    <input
                        class="form-control"
                        type="text"
                        maxlength="48"
                        placeholder="artist..."
                        autocomplete="off"
                        v-model="filterValue"
                    />
                    <div class="input-group-append">
                        <slot></slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
	</div>
	<div class="container bg-container py-1">
		<div class="row">
			<div class="col">
				<h3 class="ml-2">In-progress</h3>
				<h5 class="ml-4">
					<a href="#projectedRelease" data-toggle="collapse" >
						Projected for release ({{projectedReleaseArtists.length}})
						<i class="fas fa-angle-down" />
					</a>
				</h5>
				<div id="projectedRelease" class="show">
					<transition-group name="list" tag="div" class="row">
						<artist-card
							v-for="artist in projectedReleaseArtists"
							:key="artist.id"
							:artist="artist"
							:user-id="userId"
							@update-artist="updateArtist($event)"
						></artist-card>
					</transition-group>
				</div>
				<h5 class="ml-4 mt-2">
					<a href="#discussionArtists" data-toggle="collapse" >
						Active discussion ({{discussionArtists.length}})
						<i class="fas fa-angle-down" />
					</a>
				</h5>
				<div id="discussionArtists" class="collapse">
					<transition-group name="list" tag="div" class="row">
						<artist-card
							v-for="artist in discussionArtists"
							:key="artist.id"
							:artist="artist"
							:user-id="userId"
							@update-artist="updateArtist($event)"
						></artist-card>
					</transition-group>
				</div>
				<h5 class="ml-4 mt-2">
					<a href="#contactedArtists" data-toggle="collapse" >
						Contacted ({{contactedArtists.length}})
						<i class="fas fa-angle-down" />
					</a>
				</h5>
				<div id="contactedArtists" class="collapse">
					<transition-group name="list" tag="div" class="row">
						<artist-card
							v-for="artist in contactedArtists"
							:key="artist.id"
							:artist="artist"
							:user-id="userId"
							@update-artist="updateArtist($event)"
						></artist-card>
					</transition-group>
				</div>
				<h5 class="ml-4 mt-2">
					<a href="#currentArtistUpdates" data-toggle="collapse" >
						Current artist updates ({{updateArtists.length}})
						<i class="fas fa-angle-down" />
					</a>
				</h5>
				<div id="currentArtistUpdates" class="collapse">
					<transition-group name="list" tag="div" class="row">
						<artist-card
							v-for="artist in updateArtists"
							:key="artist.id"
							:artist="artist"
							@update-artist="updateArtist($event)"
						></artist-card>
					</transition-group>
				</div>
			</div>
		</div>
	</div>
	
	<div class="radial-divisor mx-auto my-4"></div>

	<div class="container bg-container py-1">
		<div class="row">
			<div class="col">
				<h3 class="ml-2">Inactive</h3>
				<h5 class="ml-4 mt-2">
					<a href="#notContacted" data-toggle="collapse" >
						Not contacted ({{notContacted.length}})
						<i class="fas fa-angle-down" />
					</a>
					<button class="btn btn-sm btn-outline-info" data-toggle="modal" data-target="#addArtist">Add artist</button>
				</h5>
				<div id="notContacted" class="collapse">
					<transition-group name="list" tag="div" class="row">
						<artist-card
							v-for="artist in notContacted"
							:key="artist.id"
							:artist="artist"
							@update-artist="updateArtist($event)"
							@delete-artist="deleteArtist($event)"
						></artist-card>
					</transition-group>
					<div class="radial-divisor mx-auto my-4"></div>
				</div>
				<h5 class="ml-4 mt-2">
					<a href="#upToDate" data-toggle="collapse" >
						Up to date ({{upToDate.length}})
						<i class="fas fa-angle-down" />
					</a>
				</h5>
				<div id="upToDate" class="collapse">
					<transition-group name="list" tag="div" class="row">
						<artist-card
							v-for="artist in upToDate"
							:key="artist.id"
							:artist="artist"
							@update-artist="updateArtist($event)"
						></artist-card>
					</transition-group>
					<div class="radial-divisor mx-auto my-4"></div>
				</div>
				<h5 class="ml-4 mt-2">
					<a href="#rejected" data-toggle="collapse" >
						Rejected/Ghosted ({{rejected.length}})
						<i class="fas fa-angle-down" />
					</a>
				</h5>
				<div id="rejected" class="collapse">
					<transition-group name="list" tag="div" class="row">
						<artist-card
							v-for="artist in rejected"
							:key="artist.id"
							:artist="artist"
							@update-artist="updateArtist($event)"
						></artist-card>
					</transition-group>
					<div class="radial-divisor mx-auto my-4"></div>
				</div>
			</div>
		</div>
	</div>
		
	<add-artist></add-artist>
</div>
</template>

<script>
import AddArtist from '../components/artists/AddArtist.vue';
import ArtistCard from '../components/artists/ArtistCard.vue';
import FilterBox from '../components/FilterBox.vue';

export default {
    name: 'artist-page',
    components: {
		AddArtist,
		ArtistCard,
		FilterBox
	},
	watch: {
		allArtists: function(v) {
			if(v){
				this.filter();
			}
		},
		filterValue: function(v) {
            this.filter();
        },
	},
    methods: {
		executePost: async function (path, data, e) {
			if (e) e.target.disabled = true;

			try {
				const res = await axios.post(path, data)

				if (res.data.error) {
					this.info = res.data.error;
				} else {
					if (e) e.target.disabled = false;
					return res.data;
				}
			} catch (error) {
				console.log(error)
			}

			if (e) e.target.disabled = false;
		},
		separateObjs: function() {
			this.notContacted = [];
			this.upToDate = [];
			this.rejected = [];
			this.updateArtists = [];
			this.projectedReleaseArtists = [];
			this.discussionArtists = [];
			this.contactedArtists = [];
			this.filteredArtists.forEach(artist => {
				if(!artist.isContacted){
					this.notContacted.push(artist);
				}else if(artist.isUpToDate){
					this.upToDate.push(artist);
				}else if(artist.isRejected){
					this.rejected.push(artist);
				}else if(artist.osuId && !artist.isUpToDate){
					this.updateArtists.push(artist);
				}else if(artist.projectedRelease){
					this.projectedReleaseArtists.push(artist);
				}else if(artist.isResponded){
					this.discussionArtists.push(artist);
				}else if(artist.isContacted && !artist.isResponded){
					this.contactedArtists.push(artist);
				}
			});
			//sort projected release artists
			this.projectedReleaseArtists.sort(function(a,b){
				if(a.projectedRelease< b.projectedRelease) return -1;
				if(a.projectedRelease >b.projectedRelease) return 1;
				if(a.projectedRelease< b.projectedRelease) return -1;
				if(a.projectedRelease >b.projectedRelease) return 1;
				return 0;
			});

			//sort discussion artists
			this.discussionArtists.sort(function(a,b){
				if(a.lastContacted< b.lastContacted) return 1;
				if(a.lastContacted >b.lastContacted) return -1;
				if(a.lastContacted< b.lastContacted) return 1;
				if(a.lastContacted >b.lastContacted) return -1;
				return 0;
			});
			for (let i = 0; i < this.discussionArtists.length; i++) {
				let artist = this.discussionArtists[i];
				if(artist.isPriority){
					this.discussionArtists.splice(i,1);
					this.discussionArtists.unshift(artist);
				}
			}

			//sort contacted artists
			this.contactedArtists.sort(function(a,b){
				if(a.lastContacted< b.lastContacted) return 1;
				if(a.lastContacted >b.lastContacted) return -1;
				if(a.lastContacted< b.lastContacted) return 1;
				if(a.lastContacted >b.lastContacted) return -1;
				return 0;
			});
			for (let i = 0; i < this.contactedArtists.length; i++) {
				let artist = this.contactedArtists[i];
				if(artist.isPriority){
					this.contactedArtists.splice(i,1);
					this.contactedArtists.unshift(artist);
				}
			}
			
			//sort pending update artists
			this.updateArtists.sort(function(a,b){
				if(a.lastContacted< b.lastContacted) return 1;
				if(a.lastContacted >b.lastContacted) return -1;
				if(a.lastContacted< b.lastContacted) return 1;
				if(a.lastContacted >b.lastContacted) return -1;
				return 0;
			});
			for (let i = 0; i < this.updateArtists.length; i++) {
				let artist = this.updateArtists[i];
				if(artist.isPriority){
					this.updateArtists.splice(i,1);
					this.updateArtists.unshift(artist);
				}
			}

			//sort not contacted artists
			for (let i = 0; i < this.notContacted.length; i++) {
				let artist = this.notContacted[i];
				if(artist.isPriority){
					this.notContacted.splice(i,1);
					this.notContacted.unshift(artist);
				}
			}

			//sort rejected artists
			this.rejected.sort(function(a,b){
				if(a.lastContacted< b.lastContacted) return 1;
				if(a.lastContacted >b.lastContacted) return -1;
				if(a.lastContacted< b.lastContacted) return 1;
				if(a.lastContacted >b.lastContacted) return -1;
				return 0;
			});
			for (let i = 0; i < this.rejected.length; i++) {
				let artist = this.rejected[i];
				if(artist.isPriority){
					this.rejected.splice(i,1);
					this.rejected.unshift(artist);
				}
			}
		},
		updateArtist: function (artist) {
			let i = this.allArtists.findIndex(a => a.id == artist.id);
			this.allArtists[i] = artist;
			i = this.filteredArtists.findIndex(a => a.id == artist.id);
			this.filteredArtists[i] = artist;
			this.separateObjs();
		},
		deleteArtist: function (artist) {
			const i = this.allArtists.findIndex(a => a.id === artist.id);
			this.allArtists.splice(i, 1);
			this.separateObjs();
		},
		filter: function() {
			if (this.filterValue.length > 2) {
				this.filteredArtists = this.allArtists.filter(a => {
					if (a.label.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1) {
						return true;
					}
					return false;
				});
			}else{
				this.filteredArtists = this.allArtists;
			}
			this.separateObjs();
		},
	},
	data () {
		return {
			allArtists: null,
			filteredArtists: null,
			notContacted: [],
			upToDate: [],
			projectedReleaseArtists: [],
			discussionArtists: [],
			contactedArtists: [],
			updateArtists: [],
			rejected: [],

			showNotContacted: false,
			showUpToDate: false,
			showRejected: false,

			filterValue: '',
		}
    },
    created () {
        axios
			.get('/artists/relevantInfo')
			.then(response => {
				this.allArtists = response.data.artists;
				this.filteredArtists = response.data.artists;
				this.userId = response.data.userId;
			}).then(function(){
				$("#loading").fadeOut();
				$("#app").attr("style", "visibility: visible").hide().fadeIn();
			});
    }
}
</script>

<style>
.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}
</style>
