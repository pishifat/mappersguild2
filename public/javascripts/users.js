$(document).ready(function () {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
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
            beatmaps: null,
            selectedUser: null,
			sortBy: null,
			asc: false,
        }
    },
    mounted() {
        axios
            .get('/users/relevantInfo')
            .then(response => {
                this.users = response.data.users;
                this.beatmaps = response.data.beatmaps;
            });
    }
});

setInterval(() => {
    axios
        .get('/users/relevantInfo')
        .then(response => {
            usersVue.users = response.data.users;
            usersVue.beatmaps = response.data.beatmaps;
			usersVue.sort(usersVue.sortBy, true);
        });
}, 30000);
