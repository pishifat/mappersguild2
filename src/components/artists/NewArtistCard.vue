<template>
<div class="col-sm-12 my-1">
    <div class="card static-card" :class="artist.isPriority ? 'card-bg-priority' : 'bg-dark'">
        <div class="card-body text-shadow min-spacing">
            <div class="min-spacing mt-1 row">
                <span class="col-sm-4">
                    <a :href="'#details' + artist.id" data-toggle="collapse">
                        {{artist.label}}
                        <i class="fas fa-angle-down" />
                    </a>
                </span>
                <span class="small col-sm-4">
                    status:
                    <span v-if="artist.projectedRelease" class="done">{{new Date(artist.projectedRelease).toString().slice(4,15)}}</span>
                    <span v-else-if="artist.songsTimed" class="text-white-50">songs timed</span>
                    <span v-else-if="artist.contractPaid" class="text-white-50">paid contract</span>
                    <span v-else-if="artist.contractSigned" class="text-white-50">signed contract</span>
                    <span v-else-if="artist.contractSent" class="text-white-50">sent contract</span>
                    <span v-else-if="artist.isResponded" class="text-white-50">discussing</span>
                    <span v-else-if="artist.isContacted" class="text-white-50">contacted</span>
                </span>
                
                
                <span class="col-sm-4">
                    <a href="#" v-if="!artist.isContacted" class="float-right small icon-used ml-2" data-toggle="tooltip" data-placement="top" title="delete" @click.prevent="deleteArtist()">
                        <i class="fas fa-trash"></i>
                    </a>
                    <a href="#" class="float-right small icon-valid ml-2" data-toggle="tooltip" data-placement="top" :title="artist.isPriority ? 'mark as low priority' : 'mark as high priority'" @click.prevent="toggleIsPriority()">
                        <i class="fas" :class="artist.isPriority ? 'fa-arrow-down' : 'fa-arrow-up'"></i>
                    </a>
                    <a href="#" class="float-right small icon-used" data-toggle="tooltip" data-placement="top" title="reset progress (except notes)" @click.prevent="reset()">
                        <i class="fas fa-undo-alt"></i>
                    </a>
                    


                    <span class="min-spacing text-center font-8 text-white-50 float-right mr-2">
                        last contacted: {{artist.lastContacted ? new Date(artist.lastContacted).toString().slice(4,15) : 'never'}}
                        <a href="#" @click.prevent="showContactedInput = !showContactedInput">
                            <i class="fas fa-edit"></i>
                        </a>
                    </span>
                    <span v-if="showContactedInput" class="small float-right">
                        <input
                            class="custom-input small w-50"
                            type="text"
                            placeholder="mm-dd-yyyy"
                            style="border-radius: 5px 5px 5px 5px; "
                            maxlength="10"
                            v-model="contactedInput"
                            @keyup.enter="updateLastContacted()"
                        >
                        <a href="#" @click.stop.prevent="contactedToday()">mark as today</a>
                    </span>
                </span>
            </div>
            <div :id="'details' + artist.id" class="collapse ml-2">
                <!--fix from here-->
                <p class="small text-shadow min-spacing">
                    Contacted: 
                    <a href="#" @click.stop.prevent="toggleIsContacted()">
                        <i class="fas" :class="artist.isContacted ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing">
                    Offer rejected: 
                    <a href="#" @click.stop.prevent="toggleIsRejected()">
                        <i class="fas" :class="artist.isContacted ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>

                <p class="small text-shadow min-spacing">
                    Up to date: 
                    <a href="#" @click.stop.prevent="toggleIsUpToDate()">
                        <i class="fas" :class="artist.isUpToDate ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing">
                    Invited to Discord: 
                    <a href="#" @click.stop.prevent="toggleIsInvited()">
                        <i class="fas" :class="artist.isInvited ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                    
                <p class="sub-header text-shadow min-spacing">Discussion...</p>
                <p class="small text-shadow min-spacing ml-2">
                    Contacted: 
                    <a href="#" @click.stop.prevent="toggleIsContacted()">
                        <i class="fas" :class="artist.isContacted ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing ml-2">
                    Responded: 
                    <a href="#" @click.stop.prevent="toggleIsResponded()">
                        <i class="fas" :class="artist.isResponded ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing ml-2">
                    Tracks confirmed: 
                    <a href="#" @click.stop.prevent="toggleTracksSelected()">
                        <i class="fas" :class="artist.tracksSelected ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p v-if="!artist.tracksSelected" class="small text-shadow min-spacing ml-2">
                    Offer rejected: 
                    <a href="#" @click.stop.prevent="toggleIsRejected()">
                        <i class="fas" :class="artist.isRejected ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>


                <p class="sub-header text-shadow min-spacing">Contract...</p>
                <p class="small text-shadow min-spacing ml-2">
                    sent: 
                    <a href="#" @click.stop.prevent="toggleContractSent()">
                        <i class="fas" :class="artist.contractSent ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing ml-2">
                    signed: 
                    <a href="#" @click.stop.prevent="toggleContractSigned()">
                        <i class="fas" :class="artist.contractSigned ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing ml-2">
                    paid: 
                    <a href="#" @click.stop.prevent="toggleContractPaid()">
                        <i class="fas" :class="artist.contractPaid ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="sub-header text-shadow min-spacing">Publication...</p>
                <p class="small text-shadow min-spacing ml-2">
                    Songs received: 
                    <a href="#" @click.stop.prevent="toggleSongsReceived()">
                        <i class="fas" :class="artist.songsReceived ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing ml-2">
                    Songs timed: 
                    <a href="#" @click.stop.prevent="toggleSongsTimed()">
                        <i class="fas" :class="artist.songsTimed ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing ml-2">
                    Visual assets received: 
                    <a href="#" @click.stop.prevent="toggleAssetsReceived()">
                        <i class="fas" :class="artist.assetsReceived ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing ml-2">
                    Bio written: 
                    <a href="#" @click.stop.prevent="toggleBioWritten()">
                        <i class="fas" :class="artist.bioWritten ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing ml-2">
                    Webpage ready: 
                    <a href="#" @click.stop.prevent="toggleIsReady()">
                        <i class="fas" :class="artist.isReady ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing ml-2">
                    Invited to Discord: 
                    <a href="#" @click.stop.prevent="toggleIsInvited()">
                        <i class="fas" :class="artist.isInvited ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing ml-2">
                    Projected release: <span :class="artist.projectedRelease ? 'done' : 'open'">{{artist.projectedRelease ? new Date(artist.projectedRelease).toString().slice(4,15) : '...'}}</span>
                    <a href="#" @click.prevent="showDateInput = !showDateInput">
                        <i class="fas fa-edit"></i>
                    </a>
                </p>
                <p v-if="showDateInput" class="small ml-3">
                    <input
                        class="custom-input small w-50"
                        type="text"
                        placeholder="mm-dd-yyyy"
                        style="border-radius: 5px 5px 5px 5px; "
                        maxlength="10"
                        v-model="dateInput"
                        @keyup.enter="updateProjectedRelease()"
                    >
                </p>
                <p class="small text-shadow min-spacing ml-2">
                    Released: 
                    <a href="#" @click.stop.prevent="toggleIsUpToDate()">
                        <i class="fas" :class="artist.isUpToDate ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
            </div>
            <div class="min-spacing mb-1 ml-2">
                <a href="#" @click.prevent="updateNotes()">
                    <i class="fas fa-edit"></i>
                </a>
                <span v-if="!showNotesInput" class="small text-shadow min-spacing text-white-50" v-html="filterLinks(artist.notes)"></span>
                <input
                    v-if="showNotesInput"
                    class="custom-input small w-75"
                    rows="4"
                    type="text"
                    placeholder="enter to submit..."
                    style="border-radius: 5px 5px 5px 5px;"
                    v-model="artist.notes"
                    @keyup.enter="updateNotes($event)"
                    @change="updateNotes($event)"
                >
                
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'artist-card',
    props: ['artist'],
    watch: {
        artist: function(){
            this.tempNotes = this.artist.notes;
        }
    },
    methods: {
        executePost: async function (path, data, e) {
			if (e) e.target.disabled = true;

			try {
				const res = await axios.post(path, data)

				if (res.data.error) {
                    this.info = res.data.error;
                    this.inviteConfirm = null;
				} else {
					if (e) e.target.disabled = false;
					return res.data;
				}
			} catch (error) {
				console.log(error)
			}

			if (e) e.target.disabled = false;
		},
        filterLinks: function (notes) {
            return (notes || "...").replace(
                /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi,
                function(match, space, url){
                    var hyperlink = url;
                    if (!hyperlink.match('^https?:\/\/')) {
                        hyperlink = 'http://' + hyperlink;
                    }
                    return space + '<a href="' + hyperlink + '" target="_blank">' + url + '</a>';
                }
            );
        },
        contactedToday: function() {
            let date = new Date();
            let month = (date.getMonth() + 1).toString();
            if(month.length == 1){
                month = "0" + month;
            }
            let day = date.getDate().toString();
            if(day.length == 1){
                day = "0" + day;
            }
            let year = date.getFullYear();
            this.contactedInput = month + "-" + day + "-" + year;
            this.updateLastContacted();
        },
        toggleIsContacted: async function (e) {
            const artist = await this.executePost('/artists/toggleIsContacted/' + this.artist.id, {value: !this.artist.isContacted }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        toggleIsResponded: async function (e) {
            const artist = await this.executePost('/artists/toggleIsResponded/' + this.artist.id, {value: !this.artist.isResponded }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        toggleIsRejected: async function (e) {
            const artist = await this.executePost('/artists/toggleIsRejected/' + this.artist.id, {value: !this.artist.isRejected }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        toggleTracksSelected: async function (e) {
            const artist = await this.executePost('/artists/toggleTracksSelected/' + this.artist.id, {value: !this.artist.tracksSelected }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        toggleContractSent: async function (e) {
            const artist = await this.executePost('/artists/toggleContractSent/' + this.artist.id, {value: !this.artist.contractSent }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        toggleContractSigned: async function (e) {
            const artist = await this.executePost('/artists/toggleContractSigned/' + this.artist.id, {value: !this.artist.contractSigned }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        toggleContractPaid: async function (e) {
            const artist = await this.executePost('/artists/toggleContractPaid/' + this.artist.id, {value: !this.artist.contractPaid }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        toggleSongsTimed: async function (e) {
            const artist = await this.executePost('/artists/toggleSongsTimed/' + this.artist.id, {value: !this.artist.songsTimed }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        toggleSongsReceived: async function (e) {
            const artist = await this.executePost('/artists/toggleSongsReceived/' + this.artist.id, {value: !this.artist.songsReceived }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        toggleAssetsReceived: async function (e) {
            const artist = await this.executePost('/artists/toggleAssetsReceived/' + this.artist.id, {value: !this.artist.assetsReceived }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        toggleBioWritten: async function (e) {
            const artist = await this.executePost('/artists/toggleBioWritten/' + this.artist.id, {value: !this.artist.bioWritten }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        toggleIsInvited: async function (e) {
            const artist = await this.executePost('/artists/toggleIsInvited/' + this.artist.id, {value: !this.artist.isInvited }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        toggleIsReady: async function (e) {
            const artist = await this.executePost('/artists/toggleIsReady/' + this.artist.id, {value: !this.artist.isReady }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        toggleIsUpToDate: async function (e) {
            const artist = await this.executePost('/artists/toggleIsUpToDate/' + this.artist.id, {value: !this.artist.isUpToDate }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        updateProjectedRelease: async function (e) {
            let dateSplit = this.dateInput.split("-");
            let date = new Date(dateSplit[2], dateSplit[0] - 1, dateSplit[1]);
            const artist = await this.executePost('/artists/updateProjectedRelease/' + this.artist.id, {date: date}, e);
            if (artist) {
                this.$emit('update-artist', artist);
                this.showDateInput = false;
            }
        },
        updateLastContacted: async function (e) {
            let dateSplit = this.contactedInput.split("-");
            let date = new Date(dateSplit[2], dateSplit[0] - 1, dateSplit[1]);
            const artist = await this.executePost('/artists/updateLastContacted/' + this.artist.id, {date: date}, e);
            if (artist) {
                this.$emit('update-artist', artist);
                this.showContactedInput = false;
            }
        },
        updateNotes: async function (e) {
            if(!e){
                this.showNotesInput = !this.showNotesInput;
            }
            if(this.artist.notes != this.tempNotes){
                this.artist.notes = this.artist.notes.trim();
                this.showNotesInput = !this.showNotesInput;
                const artist = await this.executePost('/artists/updateNotes/' + this.artist.id, {notes: this.artist.notes}, e);
                if (artist) {
                    this.$emit('update-artist', artist);
                }
            }
        },
        reset: async function (e) {
            const artist = await this.executePost('/artists/reset/' + this.artist.id, {}, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        toggleIsPriority: async function (e) {
            const artist = await this.executePost('/artists/toggleIsPriority/' + this.artist.id, {value: !this.artist.isPriority }, e);
            if (artist) {
                this.$emit('update-artist', artist);
            }
        },
        deleteArtist: async function (e) {
            const artist = await this.executePost('/artists/deleteArtist/' + this.artist.id, {}, e);
            if (artist) {
                this.$emit('delete-artist', artist);
            }
        },
    },
    data() {
        return {
            dateInput: null,
            showDateInput: false,
            contactedInput: null,
            showContactedInput: false,
            showNotesInput: false,
            tempNotes: '',
        }
    },
    created () {
        this.tempNotes = this.artist.notes;
    }
}
</script>

<style>
.min-spacing{
    margin: 0px;
    padding: 0px; 
}

.font-8{
    font-size: 8pt;
}

input,
input:focus {
    background-color: #333;
    color: white;
    border-color: transparent;
    filter: drop-shadow(1px 1px 1px #000000);
    border-radius: 0 100px 100px 0;
}

.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}
</style>
