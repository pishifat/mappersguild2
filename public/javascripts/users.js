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
        sort: function (field) {
            if (field == 'rank') {
                this.sortedByRank = this.sortedByRank === null ? true : !this.sortedByRank;
				this.sortedByUsername = null;
                this.sortedByJoin = null;
                
                this.users.sort((a, b) => {
                    if (this.sortedByRank) {
                        if (a.totalPoints > b.totalPoints) return 1;
                        if (a.totalPoints < b.totalPoints) return -1;
                    } else {
                        if (a.totalPoints < b.totalPoints) return 1;
                        if (a.totalPoints > b.totalPoints) return -1
                    }
                    return 0;
                });
            } else if (field == 'username') {
                this.sortedByUsername = this.sortedByUsername === null ? true : !this.sortedByUsername;
				this.sortedByRank = null;
                this.sortedByJoin = null;

                this.users.sort((a, b) => {
                    if (this.sortedByUsername) {
                        if (a.username > b.username) return 1;
                        if (a.username < b.username) return -1;
                    } else {
                        if (a.username < b.username) return 1;
                        if (a.username > b.username) return -1
                    }
                    return 0;
                });
            } else if (field == 'createdAt') {
                this.sortedByJoin = this.sortedByJoin === null ? true : !this.sortedByJoin;
				this.sortedByRank = null;
                this.sortedByUsername = null;

                this.users.sort((a, b) => {
                    if (this.sortedByJoin) {
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
            sortedByRank: null,
            sortedByUsername: null,
            sortedByJoin: null,
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

            if (usersVue.sortedByRank !== null) {
				usersVue.sortedByRank = !usersVue.sortedByRank;
				usersVue.sort('rank');
			} else if (usersVue.sortedByUsername !== null) {
				usersVue.sortedByUsername = !usersVue.sortedByUsername;
				usersVue.sort('members');
			} else if (usersVue.sortedByJoin !== null) {
				usersVue.sortedByJoin = !usersVue.sortedByJoin;
				usersVue.sort('createdAt');
			}
        });
}, 30000);
