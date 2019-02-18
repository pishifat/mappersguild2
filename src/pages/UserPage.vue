<template>
<div class="row">
    <div class="col-md-12">
        <h2>Users listing</h2>
        <small>Sort: 
            <a :class="sortBy === 'username' ? 'sorted' : ''" href="#" @click.prevent="sort('username')">Name</a> | 
            <a :class="sortBy === 'rank' ? 'sorted' : ''" href="#" @click.prevent="sort('rank')">Rank</a> | 
            <a :class="sortBy === 'createdAt' ? 'sorted' : ''" href="#" @click.prevent="sort('createdAt')">Joined</a>
        </small>
        
        <transition-group name="list" tag="div" class="row">
            <user-card
                v-for="user in users"
                :key="user.id"
                :user="user"
                @update:selectedUser="selectedUser = $event"
            ></user-card>
        </transition-group>
    </div>

    <user-info
        :user="selectedUser"
        :beatmaps="beatmaps"
        :user-id="userId"
        @update-user="updateUser($event)"
    ></user-info>

</div>
</template>

<script>
import UserCard from '../components/users/UserCard.vue';
import UserInfo from '../components/users/UserInfo.vue';

export default {
    name: 'user-page',
    components: {
        UserCard,
        UserInfo,
    },
    methods: {
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
        //real functions
        switchInvites: async function(e){
            const u = await this.executePost('/users/switchInvites/', {}, e);
            if(u){
                this.updateUser(u);
            }
        }
    },
    data() {
        return {
            users: null,
            userId: null,
            beatmaps: null,
            selectedUser: null,
            info: null,
            sortBy: null,
            asc: false,
        }
    },
    created() {
        axios
            .get('/users/relevantInfo')
            .then(response => {
                this.users = response.data.users;
                this.userId = response.data.userId;
                this.beatmaps = response.data.beatmaps;
            }).then(function(){
                $("#loading").fadeOut();
                $("#app").attr("style", "visibility: visible").hide().fadeIn();
            });
    },
    mounted () {
        setInterval(() => {
            axios
                .get('/users/relevantInfo')
                .then(response => {
                    this.users = response.data.users;
                    this.userId = response.data.userId;
                    this.beatmaps = response.data.beatmaps;
                });
        }, 30000);
    }
}
</script>

<style>

</style>
