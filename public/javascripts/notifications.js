$(document).ready(function () {
    var src = "../images/small.png"
    $("#load").attr("src", src);
});

const notificationsVue = new Vue({
    el: '#app',
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
        updateNotification: function (notification) {
			const i = this.notifications.findIndex(n => n.id == notification.id);
			this.notifications[i] = notification;
        },

        //mark as read
        hideNotification: async function(id, e){
            const i = this.notifications.findIndex(notif => notif.id === id);
            this.notifications.splice(i, 1);
            await this.executePost('/notifications/hideNotification/' + id, {}, e);
        },
        //mark all as read
        hideAll: async function(e){
            this.notifications = null;
            await this.executePost('/notifications/hideAll/', {}, e);
        },
        //accept various invites
        acceptInvite: async function(id, actionType, e){
            this.info = null;
            let invite;
            if(actionType == "collab"){
                invite = await this.executePost('/notifications/acceptCollab/' + id, {}, e);
            }else if(actionType == "task"){
                invite = await this.executePost('/notifications/acceptDiff/' + id, {}, e);
            }else if(actionType == "host"){
                invite = await this.executePost('/notifications/acceptHost/' + id, {}, e);
            }else if(actionType == "join"){
                invite = await this.executePost('/notifications/acceptJoin/' + id, {}, e);
            }

            if(invite){
                const i = this.invites.findIndex(inv => inv.id === invite.id);
                this.invites.splice(i, 1);
            }
        },
        //decline various invites
        declineInvite: async function(id, e){
            const i = this.invites.findIndex(inv => inv.id === id);
            this.invites.splice(i, 1);
            await this.executePost('/notifications/declineInvite/' + id, {}, e);
        },
        //decline all invites
        declineAll: async function(e){
            this.invites = null;
            await this.executePost('/notifications/declineAll/', {}, e);
        },
    },
    data() {
        return {
            notifications: null,
            invites: null,
            info: null
        }
    },
    mounted() {
        
        axios
            .get('/notifications/relevantInfo')
            .then(response => {
                this.notifications = response.data.notifications;
                this.invites = response.data.invites;
                navVue.notificationCount = response.data.notifications.length;
                navVue.inviteCount = response.data.invites.length;
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
            notificationsVue.notifications = response.data.notifications;
            notificationsVue.invites = response.data.invites;
            navVue.notificationCount = response.data.notifications.length;
            navVue.inviteCount = response.data.invites.length;
        });
}, 30000);

const navVue = new Vue({
    el: '#navVue',
    data() {
        return {
            notificationCount: null,
            inviteCount: null,
        }
    },
    mounted() {
        axios
            .get('/notifications/relevantInfo')
            .then(response => {
                this.notificationCount = response.data.notifications.length;
                this.inviteCount = response.data.invites.length;
            });
    }
});