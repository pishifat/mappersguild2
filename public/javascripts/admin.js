const adminVue = new Vue({
    el: '#app',
    methods: {
        extendedMap: function (map) {
            this.selectedMap = map;
        },
        extendedQuest: function (quest) {
            this.selectedQuest = quest;
        },
        extendedParty: function (party) {
            this.selectedParty = party;
        },
        extendedUser: function (user) {
            this.selectedUser = user;
        },
        extendedArtist: function (artist) {
            this.selectedArtist = artist;
        },
        updateMap: function(bm) {
			const i = this.beatmaps.findIndex(b => b.id == bm.id);
			this.beatmaps[i] = bm;
            this.selectedMap = bm;
        },
        updateQuest: function(q) {
			const i = this.quests.findIndex(quest => quest.id == q.id);
			this.quests[i] = q;
            this.selectedQuest = q;
        },
        updateParty: function(p) {
			const i = this.parties.findIndex(party => party.id == p.id);
			this.parties[i] = p;
            this.selectedParty = p;
        },
        updateUser: function(u) {
			const i = this.users.findIndex(user => user.id == u.id);
			this.users[i] = u;
            this.selectedUser = u;
        },
        updateArtist: function(fa) {
			const i = this.featuredArtists.findIndex(a => a.id == fa.id);
			this.featuredArtists[i] = fa;
            this.selectedArtist = fa;
            this.info = null;
		},
        executePost: async function (path, data, e) {
            if (e) e.target.disabled = true;

            try {
                const res = await axios.post(path, data)
                console.log(res);

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

        //beatmaps
        setStatus: async function(id, e){
            const status = $('#mapStatusSelect').val();
            const bm = await this.executePost('/admin/updateMapStatus/' + id, {status: status}, e);
            if(bm){
                this.updateMap(bm);
            }
        },
        removeDiff: async function(id, e){
            const taskId = $("#removeDiffSelection").val();
            const bm = await this.executePost('/admin/removeDiff/' + id, {taskId: taskId}, e);
            if(bm){
                this.updateMap(bm);
            }
        },
        removeModder: async function(id, e){
            var userId = $("#removeModderSelection").val();
            const bm = await this.executePost('/admin/removeModder/' + id, {userId: userId}, e);
            if(bm){
                this.updateMap(bm);
            }
        },
        removeNominator: async function(id, e){
            var userId = $("#removeNominatorSelection").val();
            const bm = await this.executePost('/admin/removeNominator/' + id, {userId: userId}, e);
            if(bm){
                this.updateMap(bm);
            }
        },
        updateMapUrl: async function(id, e){
            var link = $("#newLink").val()
            const bm = await this.executePost('/admin/updateMapUrl/' + id, {link: link}, e);
            if(bm){
                this.updateMap(bm);
            }
        },
        deleteMap: async function(id, e){
            const bm = await this.executePost('/admin/deleteMap/' + id, {}, e);
            if(bm){
                $('#editMap').modal('hide');
                axios
                    .get('/admin/relevantInfo')
                    .then(response => {
                        this.beatmaps = response.data.b;
                        this.quests = response.data.q;
                        this.parties = response.data.p;
                        this.users = response.data.u;
                        this.featuredArtists = response.data.fa;
                    });   
            }
        },

        //quest
        dropQuest: async function(id, e){
            const q = await this.executePost('/admin/forceDropQuest/' + id, {}, e);
            if(q){
                this.updateQuest(q);
            }
        },
        completeQuest: async function(id, e){
            const q = await this.executePost('/admin/completeQuest/' + id, {}, e);
            if(q){
                this.updateQuest(q);
            }
        },
        hideQuest: async function(id, e){
            const q = await this.executePost('/admin/hideQuest/' + id, {}, e);
            if(q){
                this.updateQuest(q);
            }
        },
        unhideQuest: async function(id, e){
            const q = await this.executePost('/admin/unhideQuest/' + id, {}, e);
            if(q){
                this.updateQuest(q);
            }
        },
        deleteQuest: async function(id, e){
            const q = await this.executePost('/admin/deleteQuest/' + id, {}, e);
            if(q){
                $('#editQuest').modal('hide');
                axios
                    .get('/admin/relevantInfo')
                    .then(response => {
                        this.beatmaps = response.data.b;
                        this.quests = response.data.q;
                        this.parties = response.data.p;
                        this.users = response.data.u;
                        this.featuredArtists = response.data.fa;
                    });   
            }
        },
        createQuest: async function(e){
            let name = $("#questName").val();
            let reward = $("#questReward").val();
            let descriptionMain = $("#questDescriptionMain").val();
            let descriptionFluff = $("#questDescriptionFluff").val();
            let timeframe = $("#questTimeframe").val();
            let minParty = $("#questMinParty").val();
            let maxParty = $("#questMaxParty").val();
            let minRank = $("#questMinRank").val();
            let art = $("#art").val();
            let exclusive = $("#exclusive").val();
            let medal = $("#medal").val();
            const q = await this.executePost('/admin/createQuest/', { 
                name: name, 
                reward: reward, 
                descriptionMain: descriptionMain, 
                descriptionFluff: descriptionFluff, 
                timeframe: timeframe, 
                minParty: minParty, 
                maxParty: maxParty, 
                minRank: minRank, 
                art: art, 
                exclusive: exclusive, 
                medal: medal 
            }, e);
            if(q){
                $('#createQuest').modal('hide');
                axios
                    .get('/admin/relevantInfo')
                    .then(response => {
                        this.beatmaps = response.data.b;
                        this.quests = response.data.q;
                        this.parties = response.data.p;
                        this.users = response.data.u;
                        this.featuredArtists = response.data.fa;
                    });   
            }
        },

        //party

        renameParty: async function(id, e){
            var name = $("#newName").val()
            const p = await this.executePost('/admin/renameParty/' + id, {name: name}, e);
            if(p){
                this.updateParty(p);
            }
        },
        removeMember: async function(id, e){
            var userId = $("#removeMemberSelection").val();
            const p = await this.executePost('/admin/removeMember/' + id, {userId: userId}, e);
            if(p){
                this.updateParty(p);
            }
        },
        transferLeader: async function(id, e){
            var userId = $("#transferLeaderSelection").val();
            const p = await this.executePost('/admin/transferLeader/' + id, {userId: userId}, e);
            if(p){
                this.updateParty(p);
            }
        },
        editBanner: async function(id, e){
            var banner = $("#bannerInput").val();
            const p = await this.executePost('/admin/editBanner/' + id, {banner: banner}, e);
            if(p){
                this.updateParty(p);
            }
        },
        deleteParty: async function(id, e){
            const p = await this.executePost('/admin/deleteParty/' + id, {}, e);
            if(p){
                $('#editParty').modal('hide');
                axios
                    .get('/admin/relevantInfo')
                    .then(response => {
                        this.beatmaps = response.data.b;
                        this.quests = response.data.q;
                        this.parties = response.data.p;
                        this.users = response.data.u;
                        this.featuredArtists = response.data.fa;
                    });   
            }
        },
        updatePartyRanks: async function(e){
            const success = await this.executePost('/admin/updatePartyRanks/', {}, e);
            if(success){
                createAlert(success);
            }
        },

        //users

        updateUserGroup: async function(id, e){
            var group = $("#userGroupSelect").val();
            const u = await this.executePost('/admin/updateUserGroup/' + id, {group: group}, e);
            if(u){
                this.updateUser(u);
            }
        },
        updateUserPoints: async function(e){
            const success = await this.executePost('/admin/updateUserPoints/', {}, e);
            if(success){
                createAlert(success);
            }
        },

        //featured artist

        addArtist: async function(e){
            let label = $("#newArtistInput").val();
            let osuId = $("#artistId").val();
            const fa = await this.executePost('/admin/addArtist/' + label, {osuId: osuId}, e);
            if(fa){
                $('#newArtist').modal('hide');
                axios
                    .get('/admin/relevantInfo')
                    .then(response => {
                        this.beatmaps = response.data.b;
                        this.quests = response.data.q;
                        this.parties = response.data.p;
                        this.users = response.data.u;
                        this.featuredArtists = response.data.fa;
                    });   
            }

        },

        renameLabel: async function(id, e){
            let name = $("#newLabelName").val();
            const fa = await this.executePost('/admin/renameLabel/' + id, {name: name}, e);
            if(fa){
                this.updateArtist(fa);
            }
        },
        addSong: async function(id, e){
            let artist = $("#artist").val();
            let title = $("#title").val();
            const fa = await this.executePost('/admin/addSong/' + id, {artist: artist, title: title}, e);
            if(fa){
                this.updateArtist(fa);
                this.info = `song added`
            }
        },
        removeSong: async function(id, e){
            let songId = $("#removeSongSelection").val();
            const fa = await this.executePost('/admin/removeSong/' + id, {songId: songId}, e);
            if(fa){
                this.updateArtist(fa);
                this.info = `song removed`
            }
        },
        updateMetadata: async function(id, e){
            let artist = $("#editedArtist").val();
            let title = $("#editedTitle").val();
            let songId = $("#editSongSelection").val();
            const fa = await this.executePost('/admin/updateMetadata/' + id, {artist: artist, title: title, songId: songId}, e);
            if(fa){
                console.log(fa);
                this.updateArtist(fa);
                this.info = `edited metadata`
            }
        }
    },
    data() {
        return {
            beatmaps: null,
            quests: null,
            parties: null,
            users: null,
            featuredArtists: null,
            selectedMap: null,
            selectedQuest: null,
            selectedParty: null,
            selectedUser: null,
            selectedArtist: null,
            info: null
        }
    },
    mounted() {
        axios
            .get('/admin/relevantInfo')
            .then(response => {
                this.beatmaps = response.data.b;
                this.quests = response.data.q;
                this.parties = response.data.p;
                this.users = response.data.u;
                this.featuredArtists = response.data.fa;
            });
    }
});

function createAlert(message) {
    var $div = $("<div>", {
        "class": "alert alert-success alert-dismissible fade show alert-fixed",
        "text": message
    });

    var $button = $("<button>", {
        "type": "button",
        "class": "close",
        "data-dismiss": "alert"
    });

    var $span = $("<span>", {
        "html": "&times;"
    });

    $button.append($span);
    $div.append($button);

    $div.appendTo("body").fadeTo(1200, 1).slideUp(500, function () {
        $(this).alert("close")
    });
}