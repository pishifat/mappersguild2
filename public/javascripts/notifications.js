$(document).ready(function () {
    var src = "../images/small.png"
    $("#load").attr("src", src);
});

const usersVue = new Vue({
    el: '#app',
    methods: {
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
        updateNotification: function (notification) {
			const i = this.notifications.findIndex(n => n.id == notification.id);
			this.notifications[i] = notification;
        },

        //mark as read
        hideNotification: async function(id, e){
            const n = await this.executePost('/notifications/hideNotification/' + id, {}, e);
            if(n){
                const i = this.notifications.findIndex(notif => notif.id === n.id);
                console.log(i)
                this.notifications.splice(i, 1);
            }
        },
    },
    data() {
        return {
            notifications: null,
            invites: null,
        }
    },
    mounted() {
        axios
            .get('/notifications/relevantInfo')
            .then(response => {
                this.notifications = response.data.notifications;
                this.invites = response.data.invites;
            }).then(function(){
                $("#loading").fadeOut();
				$("#app").attr("style", "visibility: visible").hide().fadeIn();
			});
    }
});

setInterval(() => {
    axios
        .get('/notifications/relevantInfo')
        .then(response => {
            usersVue.notifications = response.data.notifications;
            usersVue.invites = response.data.invites;
        });
}, 30000);
