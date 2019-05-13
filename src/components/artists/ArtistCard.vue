<template>
<div class="col-xl-3 col-lg-4 col-md-4 col-sm-6 my-2">
    <div class="card bg-dark static-card">
        <div class="card-header text-shadow artist-card-spacing">
            {{artist.label.length - 3 > 20 ? artist.label.slice(0,20) + "..." : artist.label}} 
            <a href="#" v-if="!artist.isContacted" class="float-right small icon-used ml-2" data-toggle="tooltip" data-placement="top" title="delete" @click.prevent="deleteArtist()">
                <i class="fas fa-trash"></i>
            </a>
            <a href="#" class="float-right small icon-used" data-toggle="tooltip" data-placement="top" title="reset progress (except notes)" @click.prevent="reset()">
                <i class="fas fa-undo-alt"></i>
            </a>
            
        </div>
        <div :id="'body' + artist.id" class="card-body artist-card">
            <p v-if="!artist.isContacted" class="small text-shadow min-spacing">
                Contacted: 
                <a href="#" @click.stop.prevent="toggleIsContacted()">
                    <i class="fas" :class="artist.isContacted ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                </a>
            </p>
            <p v-else-if="artist.isRejected" class="small text-shadow min-spacing">
                Offer rejected: 
                <a href="#" @click.stop.prevent="toggleIsRejected()">
                    <i class="fas" :class="artist.isContacted ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                </a>
            </p>
            <span v-else-if="artist.osuId">
                <p class="small text-shadow min-spacing">
                    Up to date: 
                    <a href="#" @click.stop.prevent="toggleIsUpToDate()">
                        <i class="fas" :class="artist.isUpToDate ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing">
                    Pending update: 
                    <a href="#" @click.stop.prevent="toggleIsPendingUpdate()">
                        <i class="fas" :class="artist.isPendingUpdate ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing">
                    Invited to Discord: 
                    <a href="#" @click.stop.prevent="toggleIsInvited()">
                        <i class="fas" :class="artist.isInvited ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
            </span>
            <span v-else-if="!artist.tracksSelected">
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
            </span>

            <span v-if="artist.isContacted && artist.isResponded && artist.tracksSelected && !artist.isRejected && !artist.osuId && !(artist.contractSent && artist.contractSigned && artist.contractPaid)">
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
            </span>
            <span v-if="artist.contractSent && artist.contractSigned && artist.contractPaid && !artist.osuId">
                <p class="sub-header text-shadow min-spacing">Publication...</p>
                <p class="small text-shadow min-spacing ml-2">
                    Songs timed: 
                    <a href="#" @click.stop.prevent="toggleSongsTimed()">
                        <i class="fas" :class="artist.songsTimed ? 'icon-valid fa-check' : 'icon-used fa-times'"></i>
                    </a>
                </p>
                <p class="small text-shadow min-spacing ml-2">
                    Assets received: 
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
            </span>
            <p class="text-shadow min-spacing mt-2"><span class="sub-header">Notes:</span> 
                <a href="#" @click.prevent="updateNotes()">
                    <i class="fas fa-edit"></i>
                </a>
            </p>
            <p v-if="!showNotesInput" class="small text-shadow min-spacing ml-2 mb-3 notes-pre">
                {{artist.notes || '...'}}
            </p>
            <textarea
                v-if="showNotesInput"
                class="custom-input small mb-5 ml-2 w-100"
                rows="4"
                type="text"
                placeholder="shift+enter for new line, enter for submit..."
                style="border-radius: 5px 5px 5px 5px;"
                v-model="artist.notes"
                @keyup.enter="updateNotes($event)"
            ></textarea>
            <br>
            <div class="card-footer text-muted footer-spacing">
                <p class="min-spacing text-center" style="font-size: 8pt;">updated {{new Date(artist.updatedAt).toString().slice(4,15)}}</p>
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
        toggleIsPendingUpdate: async function (e) {
            const artist = await this.executePost('/artists/toggleIsPendingUpdate/' + this.artist.id, {value: !this.artist.isPendingUpdate }, e);
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
            }
        },
        updateNotes: async function (e) {
            let submit;
            if(e && e.keyCode == 13 && !e.shiftKey){
                submit = true;
            }else if(!e){
                this.showNotesInput = !this.showNotesInput;
            }
            if(this.artist.notes != this.tempNotes && submit){
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
.artist-card {
    margin: 0.25rem 0.5rem 0.25rem 0.5rem ;
    padding: 0.5rem 0.5rem 0.5rem 0.5rem;
}

.sub-header {
    font-size: 11pt;
}

.footer-spacing {
    position:absolute;
    left:0; 
    bottom:0; 
    width:100%
}

.fas:hover {
    color: var(--ranked); 
    text-decoration: none;
}

.fas:active {
    color: var(--clicked); 
}

.notes-pre{
    white-space: pre-line;
    margin-top: -1.5em !important;
}

</style>
