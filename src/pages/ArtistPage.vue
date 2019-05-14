<template>
<div>
	<div class="container bg-container py-1">
		<div class="row">
			<div class="col">
				<h2>In progress</h2>
				<h4 class="ml-4">New artists</h4>
				<div>
					<transition-group name="list" tag="div" class="row">
						<artist-card
							v-for="artist in newArtists"
							:key="artist.id"
							:artist="artist"
							@update:selectedArtist="selectedArtist = $event"
							@update-artist="updateArtist($event)"
						></artist-card>
					</transition-group>
				</div>
				<h4 class="ml-4 mt-4">Current artist updates</h4>
				<div>
					<transition-group name="list" tag="div" class="row">
						<artist-card
							v-for="artist in updateArtists"
							:key="artist.id"
							:artist="artist"
							@update:selectedArtist="selectedArtist = $event"
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
				<h2>Not contacted <button class="btn btn-outline-info" data-toggle="modal" data-target="#addArtist">Add artist</button></h2>
				<a href="#" class="ml-2" @click.prevent="showNotContacted = !showNotContacted">{{showNotContacted ? 'Hide' : 'Show'}} {{notContacted.length}} {{notContacted.length == 1 ? 'entry' : 'entries'}}</a>
				<div v-if="showNotContacted">
					<transition-group name="list" tag="div" class="row">
						<artist-card
							v-for="artist in notContacted"
							:key="artist.id"
							:artist="artist"
							@update:selectedArtist="selectedArtist = $event"
							@update-artist="updateArtist($event)"
							@delete-artist="deleteArtist($event)"
						></artist-card>
					</transition-group>
					<div class="radial-divisor mx-auto my-4"></div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col">
				<h2 class="mt-4">Up to date</h2>
				<a href="#" class="ml-2" @click.prevent="showUpToDate = !showUpToDate">{{showUpToDate ? 'Hide' : 'Show'}} {{upToDate.length}} {{upToDate.length == 1 ? 'entry' : 'entries'}}</a>
				<div v-if="showUpToDate">
					<transition-group name="list" tag="div" class="row">
						<artist-card
							v-for="artist in upToDate"
							:key="artist.id"
							:artist="artist"
							@update:selectedArtist="selectedArtist = $event"
							@update-artist="updateArtist($event)"
						></artist-card>
					</transition-group>
					<div class="radial-divisor mx-auto my-4"></div>
				</div>
			</div>
		</div>		
		<div class="row">
			<div class="col">
				<h2 class="mt-4">Rejected</h2>
				<a href="#" class="ml-2" @click.prevent="showRejected = !showRejected">{{showRejected ? 'Hide' : 'Show'}} {{rejected.length}} {{rejected.length == 1 ? 'entry' : 'entries'}}</a>
				<div v-if="showRejected">
					<transition-group name="list" tag="div" class="row">
						<artist-card
							v-for="artist in rejected"
							:key="artist.id"
							:artist="artist"
							@update:selectedArtist="selectedArtist = $event"
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

export default {
    name: 'artist-page',
    components: {
		AddArtist,
		ArtistCard,
	},
	watch: {
		allArtists: function(v) {
			if(v){
				this.separateObjs();
			}
		}
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
			this.newArtists = [];
			this.updateArtists = [];
			this.rejected = [];
			this.allArtists.forEach(artist => {
				if(!artist.isContacted){
					this.notContacted.push(artist);
				}else if(artist.isUpToDate){
					this.upToDate.push(artist);
				}else if(artist.isRejected){
					this.rejected.push(artist);
				}else if(artist.isPendingUpdate){
					this.updateArtists.push(artist);
				}else{
					this.newArtists.push(artist);
				}
			});
			this.newArtists.sort(function(a,b){
				if(a.lastContacted< b.lastContacted) return 1;
				if(a.lastContacted >b.lastContacted) return -1;
				if(a.lastContacted< b.lastContacted) return 1;
				if(a.lastContacted >b.lastContacted) return -1;
				return 0;
			});
			for (let i = 0; i < this.newArtists.length; i++) {
				let artist = this.newArtists[i];
				if(artist.isPriority){
					this.newArtists.splice(i,1);
					this.newArtists.unshift(artist);
				}
			}
			for (let i = 0; i < this.newArtists.length; i++) {
				let artist = this.newArtists[i];
				if(artist.projectedRelease){
					this.newArtists.splice(i,1);
					this.newArtists.unshift(artist);
				}
			}
			this.newArtists.sort(function(a,b){
				if(a.projectedRelease< b.projectedRelease) return -1;
				if(a.projectedRelease >b.projectedRelease) return 1;
				if(a.projectedRelease< b.projectedRelease) return -1;
				if(a.projectedRelease >b.projectedRelease) return 1;
				return 0;
			});
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
			this.rejected.sort(function(a,b){
				if(a.lastContacted< b.lastContacted) return 1;
				if(a.lastContacted >b.lastContacted) return -1;
				if(a.lastContacted< b.lastContacted) return 1;
				if(a.lastContacted >b.lastContacted) return -1;
				return 0;
			});
		},
		updateArtist: function (artist) {
			const i = this.allArtists.findIndex(a => a.id == artist.id);
			this.allArtists[i] = artist;
			this.selectedArtist = artist;
			this.separateObjs();
		},
		deleteArtist: function (artist) {
			const i = this.allArtists.findIndex(a => a.id === artist.id);
			this.allArtists.splice(i, 1);
			this.separateObjs();
		}
	},
	data () {
		return {
			allArtists: null,
			notContacted: [],
			upToDate: [],
			newArtists: [],
			updateArtists: [],
			rejected: [],

			showNotContacted: false,
			showUpToDate: false,
			showRejected: false,

            selectedArtist: null,
		}
    },
    created () {
        axios
			.get('/artists/relevantInfo')
			.then(response => {
				this.allArtists = response.data.artists;
			}).then(function(){
				$("#loading").fadeOut();
				$("#app").attr("style", "visibility: visible").hide().fadeIn();
			});
    }
}
</script>

<style>

</style>
