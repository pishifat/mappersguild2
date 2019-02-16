$(document).ready(function () {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    var src = "../images/small.png"
    $("#load").attr("src", src);
    //this is jquery because
    //1. the loading div is in layout, so putting it in vue would mean pasting it in all pages
    //2. i want the entirety of #app to be invisible until things load
    //3. i dont know a better way to do it with vue
});

const usersVue = new Vue({
    el: '#app',
    methods: {
        extendedInfo: function (user) {
            this.selectedUser = user;
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
        updateUser: function(u) {
			const i = this.beatmaps.findIndex(user => user.id == u.id);
			this.users[i] = u;
            this.selectedUser = u;
        },
        sort: function (field, keepOrder) {
            this.sortBy = field;
			if (!keepOrder) {
				this.asc = !this.asc;
            }
            
            if (field == 'rank') {
                this.users.sort((a, b) => {
                    if (this.asc) {
                        if (a.totalPoints > b.totalPoints) return 1;
                        if (a.totalPoints < b.totalPoints) return -1;
                    } else {
                        if (a.totalPoints < b.totalPoints) return 1;
                        if (a.totalPoints > b.totalPoints) return -1
                    }
                    return 0;
                });
            } else if (field == 'username') {
                this.users.sort((a, b) => {
                    if (this.asc) {
                        return a.username.localeCompare(b.username);
                    } else {
                        return b.username.localeCompare(a.username);
                    }
                });
            } else if (field == 'createdAt') {
                this.users.sort((a, b) => {
                    if (this.asc) {
                        if (a.createdAt > b.createdAt) return 1;
                        if (a.createdAt < b.createdAt) return -1;
                    } else {
                        if (a.createdAt < b.createdAt) return 1;
                        if (a.createdAt > b.createdAt) return -1
                    }
                    return 0;
                });
            }
        },
        userTasks: function (beatmap) {
            let tasks = "";
            beatmap.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if (mapper._id == this.selectedUser.id) {
                        tasks += task.name + ", "
                    }
                });
            });
            return tasks.slice(0, -2);
        },
        //real functions
        switchInvites: async function(e){
            const u = await this.executePost('/users/switchInvites/', {}, e);
            if(u){
                this.updateUser(u);
            }
        }
    },
    computed: {
        userMaps: function () {
            return this.beatmaps.filter(b => {
                return b.tasks.some(t => {
                    return t.mappers.some(m => {
                        return m.id == this.selectedUser.id;
                    })
                });
            });
        },

    },
    data() {
        return {
            users: null,
            userId: null,
            beatmaps: null,
            selectedUser: null,
			sortBy: null,
            asc: false,
            doneLoading: null,
        }
    },
    mounted() {
        axios
            .get('/users/users')
            .then(response => {
                this.users = response.data.users;
                this.userId = response.data.userId;
            }).then(function(){
                $("#loading").fadeOut();
                $("#app").attr("style", "visibility: visible").hide().fadeIn();
                axios
                    .get('/users/beatmaps')
                    .then(response2 => {
                        usersVue.beatmaps = response2.data.beatmaps;
                        $('.card').attr("data-toggle", "modal");
                    });
			});
        
    }
});

setInterval(() => {
    axios
        .get('/users/users')
        .then(response => {
            usersVue.users = response.data.users;
            usersVue.userId = response.data.userId;
            usersVue.sort(usersVue.sortBy, true);
        }).then(function(){
            axios
                .get('/users/beatmaps')
                .then(response2 => {
                    usersVue.beatmaps = response2.data.beatmaps;
                });
        });
        
}, 30000);
