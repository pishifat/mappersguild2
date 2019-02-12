$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});

Vue.component("beatmap-card", {
    props: ['beatmap', 'extendedInfo'],
    methods: {
        formatMetadata: function(artist, title) {
            let str = artist + " - " + title;
            if(str.length>39){
                return str.slice(0,39) + "...";
            }else{
                return str;
            }
        },
        processUrl: function(beatmapUrl){
            let url = 'https://osu.ppy.sh/images/layout/beatmaps/default-bg.png';

            if (beatmapUrl && beatmapUrl.indexOf('osu.ppy.sh/beatmapsets/') !== -1) {
                let indexStart = beatmapUrl.indexOf('beatmapsets/') + 'beatmapsets/'.length;
                let indexEnd = beatmapUrl.indexOf('#');
                let idUrl;
                if (indexEnd !== -1) {
                    idUrl = beatmapUrl.slice(indexStart, indexEnd);
                } else {
                    idUrl = beatmapUrl.slice(indexStart);
                }
        
                url = `https://assets.ppy.sh/beatmaps/${idUrl}/covers/card.jpg`;
            }
        
            return url;
        },
        processDiffs: function(tasks, tasksLocked){
            const diffs = [
                {name:"Easy", short:"E", count: 0}, 
                {name:"Normal", short:"N", count: 0}, 
                {name:"Hard", short:"H", count: 0}, 
                {name:"Insane", short:"I", count: 0}, 
                {name:"Expert", short:"X", count: 0}, 
            ];

            let diffsBlock = '';

            if(tasks.length >= 10){
                let singleStatus;
                diffs.forEach(diff => {
                    tasks.forEach(task => {
                        if(diff.name == task.name){
                            diff.count++;
                            singleStatus = task.status.toLowerCase();
                        }
                    });
                    if(diff.count > 0){
                        if(diff.count == 1){
                            diffsBlock += `<span class="px-1 text-shadow ${singleStatus}">${ diff.short }</span>`;
                        }else{
                            diffsBlock += `<span class="px-1 text-shadow" data-toggle="tooltip" data-placement="top" title="${diff.count}">${ diff.short }${diff.count > 1 ? '+' : ''}</span>`;
                        }
                    }else if(tasksLocked.indexOf(diff.name) >= 0){
                        diffsBlock += `<span class="px-1 text-shadow blocked">${ diff.short }</span>`;
                    }else{
                        diffsBlock += `<span class="px-1 text-shadow open">${ diff.short }</span>`;
                    }
                });
            }else{
                diffs.forEach(diff => {
                    let isClaimed = false;
                    let isUsed = false;
                    tasks.forEach(task => {
                        if(diff.name == task.name){
                          diffsBlock += `<span class="px-1 text-shadow ${ task.status.toLowerCase() }">${ diff.short }</span>`;
            
                          isClaimed = true;
                          isUsed = true;
                        }
                    });
                    tasksLocked.forEach(task => {
                        if (diff.name == task) {
                            if (!isClaimed){
                                diffsBlock += `<span class="px-1 text-shadow blocked">${ diff.short }</span>`;
                            }
                            
                            isUsed = true;
                        }
                    });
                    if (!isUsed) {
                        diffsBlock += `<span class="px-1 text-shadow open">${ diff.short }</span>`;
                    }
                });
            }
            return diffsBlock;
        },
    },
    template: 
        `<div class='my-2 col-sm-12' :class='beatmap.status == "WIP" ? "col-md-6" : ""' @click="extendedInfo(beatmap)">
            <div class='card map-card custom-bg-dark' :class='beatmap.status == "WIP" ? " border-status-wip" : "border-status-done"' data-toggle='modal' data-target='#editBeatmap' :data-mapid="beatmap.id">
                <img class='card-img' :src="processUrl(beatmap.url)" style='opacity:0.5; overflow:hidden'> 
                <div class='card-img-overlay' style='padding: 0.50rem 0.50rem 0 0.50rem'>
                    <p class='card-title mb-1 text-shadow'>{{ formatMetadata(beatmap.song.artist, beatmap.song.title) }}</p>
                <small class='card-text text-shadow'>
                    Hosted by <a :href="'https://osu.ppy.sh/users/' + beatmap.host.osuId" target="_blank" @click.stop>{{beatmap.host.username}}</a> 
                    <i v-if="beatmap.mode == 'taiko'" class="fas fa-drum"></i>
                    <i v-else-if="beatmap.mode == 'catch'" class="fas fa-apple-alt"></i>
                    <i v-else-if="beatmap.mode == 'mania'" class="fas fa-stream"></i>
                    <span class='font-weight-bold float-right' style='text-shadow: 1px 1px 3px black;' v-html="processDiffs(beatmap.tasks, beatmap.tasksLocked)"></span>
                </small> 
                </div>
            </div>
        </div>`
});

const beatmapsVue = new Vue({
	el: '#app',
	methods: {
		extendedInfo: function(beatmap) {
            this.selectedMap = beatmap;
            this.info = null;
            this.isHost = (this.userOsuId == beatmap.host.osuId);
            this.addCollabInput = null;
            this.removeCollabInput = null;
            this.editLinkInput = null;
            this.collabTask = null;
            this.sortDiffs();
        },
        resetArtist: function(){
            this.featuredSongs = null;
            this.info = null;
        },
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
				console.log(error)
			}
			
			if (e) e.target.disabled = false;
        },
        updateMap: function(bm) {
			const i = this.beatmaps.findIndex(b => b.id == bm.id);
			this.beatmaps[i] = bm;
            this.selectedMap = bm;
            this.info = null;
            this.sortDiffs();
        },
        sortDiffs: function(){
            let sortOrder = ["Easy", "Normal", "Hard", "Insane", "Expert", "Storyboard"]
            this.selectedMap.tasks.sort(function(a, b) {
                return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
            });
        },

        //display methods
        createCollapseId(name){
            return name.split(' ').join('');
        },
        isOwner(mappers){
            let value;
            mappers.forEach(mapper => {
                if(mapper.osuId == this.userOsuId){
                    value = true;
                }
            });
            return value;
        },
        isModder(){
            let value;
            this.selectedMap.modders.forEach(modder => {
                if(modder.osuId == this.userOsuId){
                    value = true;
                }
            });
            return value;
        },
        isBn(){
            let value;
            this.selectedMap.bns.forEach(bn => {
                if(bn.osuId == this.userOsuId){
                    value = true;
                }
            });
            return value;
        },
        urlLength(url){
            if(url.length > 40){
                return url.slice(0, 40) + "...";
            }else{
                return url;
            }
        },
        hasBeatmaps(quest, state) {
            return quest.associatedMaps.find(m => m.status == state);
        },

        //collapse
        collapseAll(){
            $(".map-collapse").collapse('hide');
        },
        uncollapseAll(){
            $(".map-collapse").collapse('show');
        },

        //real methods

        //mode
        setMode: async function(id, mode, e){
            const bm = await this.executePost('/beatmaps/setMode/' + id, {mode: mode}, e);
            if(bm){
                this.updateMap(bm);
            }
        },

        //host
        transferHost: async function(id, e){
            const user = $('#hostEntry').val();
            const bm = await this.executePost('/beatmaps/transferHost/' + id, {user: user}, e);
            if(bm){
                $('#editBeatmap').modal('hide');
                this.updateMap(bm);
            }
        },

        //difficulties
        setCollab(task){
            this.addCollabInput = task._id;
            this.removeCollabInput = null;
            this.collabTask = task;
        },
        unsetCollab(task){
            this.removeCollabInput = task._id;
            this.addCollabInput = null;
            this.collabTask = task;
        },
        removeTask: async function(id){
            this.fakeButton = id;
            this.addCollabInput = null;
            this.removeCollabInput = null;
            const bm = await this.executePost('/beatmaps/removeTask/' + id, {beatmapId: this.selectedMap._id});
            if(bm){
                this.updateMap(bm);
            }
            this.fakeButton = null;
        },
        setTaskStatus: async function(id, status){
            this.fakeButton = id;
            this.addCollabInput = null;
            this.removeCollabInput = null;
            const bm = await this.executePost('/beatmaps/setTaskStatus/' + id, {status: status});
            if(bm){
                this.updateMap(bm);
            }
            this.fakeButton = null;
        },
        addTask: async function(id, e){
            let difficulty = $("#diffSelection").val();
            const bm = await this.executePost('/beatmaps/addTask/' + id, {difficulty: difficulty}, e);
            if(bm){
                this.updateMap(bm);
            }
        },
        addCollab: async function(e){
            const user = $('#collabMapperToAdd').val();
            const id = this.addCollabInput;
            const bm = await this.executePost('/beatmaps/task/' + id + '/addCollab', {user: user}, e);
            if(bm){
                this.updateMap(bm);
            }
        },
        removeCollab: async function(e){
            const user = $('#collabMapperToRemove').val();
            const id = this.removeCollabInput;
            const bm = await this.executePost('/beatmaps/task/' + id + '/removeCollab', {user: user}, e);
            if(bm){
                this.updateMap(bm);
            }
        },

        //status
        setStatus: async function(status, e){
            const bm = await this.executePost('/beatmaps/setStatus/' + this.selectedMap._id, {status: status}, e);
            if(bm){
                this.updateMap(bm);
            }
        },

        //quest
        setQuest: async function(){
            this.fakeButton = this.selectedMap._id + 'quest';
            const bm = await this.executePost('/beatmaps/setQuest/' + this.selectedMap._id);
            if(bm){
                if(bm.status == "WIP"){
                    $(`#${bm.quest.name.split(' ').join('')}Wip`).collapse("show");
                    $(`.non-quest-collapse-wip`).collapse();
                }else{
                    $(`#${bm.quest.name.split(' ').join('')}Done`).collapse("show");
                    $(`.non-quest-collapse-done`).collapse();
                }
                this.updateMap(bm);
                axios
                    .get('/beatmaps/relevantInfo')
                    .then(response => {
                        this.wipQuests = response.data.wipQuests;
                    });
            }
            this.fakeButton = null;
        },
        unsetQuest: async function(){
            this.fakeButton = this.selectedMap._id + 'quest';
            const bm = await this.executePost('/beatmaps/unsetQuest/' + this.selectedMap._id);
            if(bm){
                this.updateMap(bm);
            }
            this.fakeButton = null;
            axios
                .get('/beatmaps/relevantInfo')
                .then(response => {
                    this.wipQuests = response.data.wipQuests;
                });
        },

        //mod
        updateModder: async function(){
            this.fakeButton = this.selectedMap._id + "mod";
            const bm = await this.executePost('/beatmaps/updateModder/' + this.selectedMap._id);
            if(bm){
                this.updateMap(bm);
            }
            this.fakeButton = null;
        },

        //BN
        updateBn: async function(){
            this.fakeButton = this.selectedMap._id + "bn";
            const bm = await this.executePost('/beatmaps/updateBn/' + this.selectedMap._id);
            if(bm){
                this.updateMap(bm);
            }
            this.fakeButton = null;
        },

        //link
        setLink(){
            this.editLinkInput = true;
        },
        unsetLink(){
            this.editLinkInput = null;
        },
        saveLink: async function(e){
            let url = $("#newLink").val();
            const bm = await this.executePost('/beatmaps/setLink/' + this.selectedMap._id, {url: url}, e);
            if(bm){
                this.editLinkInput = null;
                this.updateMap(bm);
            }
        },
        
        //locks
        unlockTask: async function(difficulty){
            this.fakeButton = difficulty;
            const bm = await this.executePost('/beatmaps/unlockTask/' + this.selectedMap._id, {difficulty: difficulty});
            if(bm){
                this.editLinkInput = null;
                this.updateMap(bm);
            }
        },
        lockTask: async function(e){
            let difficulty = $("#lockDiffSelection").val();
            const bm = await this.executePost('/beatmaps/lockTask/' + this.selectedMap._id, {difficulty: difficulty}, e);
            if(bm){
                this.updateMap(bm);
            }
        },

        //delete
        deleteMap: async function(e){
            const result = confirm(`Are you sure you want to delete?`);
			if (result) {
                e.target.disabled = true;
                const bm = await this.executePost('/beatmaps/delete/' + this.selectedMap._id, e);
                if(bm){
                    $('#editBeatmap').modal('hide');
                    const i = this.beatmaps.findIndex(b => b.id == bm.id);
                    this.beatmaps.splice(i, 1);
                    e.target.disabled = false;
                }
            }
        },

        //new map
        setArtist: async function(e){
            let labelId = $("#artistSelection").val();
            e.target.disabled = true;
            axios
                .get('beatmaps/songs/' + labelId)
                .then(response => {
                    e.target.disabled = false;
                    this.featuredSongs = response.data;
                });
        },
        saveNewMap: async function(e){
            const song = $('#songSelection').val();
            if(song == "none"){
                this.info = "Select a song!"
            }else{
                const tasks = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert'];
                const difficulties = this.applyCheckboxes(tasks, false);
                const locks = this.applyCheckboxes(tasks, true); 
                const bm = await this.executePost('/beatmaps/create/', {song: song, tasks: difficulties, tasksLocked: locks}, e);
                if(bm){
                    $('#addBeatmap').modal('hide');
                    $('.quest-collapse-wip').collapse();
                    $('#othersWip').collapse("show");
                    this.beatmaps.unshift(bm);
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
        filter: function (field, e, keepFilter) {            
            if (this.filterBy === field && !keepFilter) {
                this.filterBy = null;
                this.beatmaps = this.tempBeatmaps;
                return;
            }

            this.filterBy = field;

            if (this.tempBeatmaps) {
                this.beatmaps = this.tempBeatmaps;
            }

            if (field == 'myMaps') {
                this.tempBeatmaps = this.beatmaps;
                this.beatmaps = this.beatmaps.filter(b => b.host.osuId === this.userOsuId);
            } else if (field == 'mapper') {
                if (e) {
                    this.filterValue = e.target.value;
                }else{
                    this.filterValue = $("#mapperFilter").val();
                }

                this.tempBeatmaps = this.beatmaps;
                this.beatmaps = this.beatmaps.filter(b => b.host.username == this.filterValue);
            } else if (field == 'gds') {
                this.tempBeatmaps = this.beatmaps;
                this.beatmaps = this.beatmaps.filter(b => (b.tasksLocked.length < 6 && b.status == "WIP"));
            }
        },
    },
    data () {
		return { 
            beatmaps: null,
            wipQuests: null,
			selectedMap: null,
            userOsuId: null,
            isHost: null,
            featuredArtists: null,
            featuredSongs: null,
            info: null,
            addCollabInput: null,
            removeCollabInput: null,
            editLinkInput: null,
            collabTask: null,
            fakeButton: null,
            searchMapper: null,
            filterBy: null,
            filterValue: null,
            tempBeatmaps: null,
		}
    },
    created () {
		axios
      		.get('/beatmaps/relevantInfo')
      		.then(response => {
                this.beatmaps = response.data.beatmaps;
                this.wipQuests = response.data.wipQuests;
                this.userOsuId = response.data.userId;
                this.featuredArtists = response.data.fa;
              });
    },
});

setInterval(() => {
    axios
        .get('/beatmaps/relevantInfo')
        .then(response => {
            beatmapsVue.beatmaps = response.data.beatmaps;
            beatmapsVue.wipQuests = response.data.wipQuests;
            beatmapsVue.userOsuId = response.data.userId;
            beatmapsVue.filter(beatmapsVue.filterBy, null, true);
        });
}, 30000);
