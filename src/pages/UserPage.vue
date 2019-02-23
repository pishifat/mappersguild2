<template>
<div class="row">
    <div class="col-md-12">
        <h2>Users listing</h2>
        <small>Search: 
            <input id="search" v-model="filterValue" type="text" placeholder="username... (3+ characters)" style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000); width: 200px;" /> 
        </small>
        <small class="pl-1">Sort: 
            <a :class="sortBy === 'username' ? 'sorted' : ''" href="#" @click.prevent="sort('username')">Name</a> | 
            <a :class="sortBy === 'rank' ? 'sorted' : ''" href="#" @click.prevent="sort('rank')">Rank</a> | 
            <a :class="sortBy === 'createdAt' ? 'sorted' : ''" href="#" @click.prevent="sort('createdAt')">Joined</a>
        </small>
        
        <button :disabled="!(pre > 0 && filterValue.length < 3)" class="btn btn-sm btn-mg mx-auto my-2" style="display:block" type="button" @click="showNewer()">
            <i class="fas fa-angle-up mr-1"></i> show next <i class="fas fa-angle-up ml-1"></i>
        </button>
        <transition-group name="list" tag="div" class="row">
            <user-card
                v-for="user in users"
                :key="user.id"
                :user="user"
                @update:selectedUser="selectedUser = $event"
            ></user-card>
        </transition-group>
        <div class="small text-center mx-auto" v-if="filterValue.length < 3">{{currentPage}} of {{pages}}</div>
        <button :disabled="!(canShowOlder && filterValue.length < 3)" class="btn btn-sm btn-mg mx-auto my-2" style="display:block" type="button" @click="showOlder()">
            <i class="fas fa-angle-down mr-1"></i> show previous <i class="fas fa-angle-down ml-1"></i>
        </button>
    </div>

    <user-info
        :user="selectedUser"
        :beatmaps="beatmaps"
        :user-id="userId"
        @update:selectedMap="selectedMap = $event"
        @update-user="updateUser($event)"
    ></user-info>

    <notifications-access></notifications-access>
</div>
</template>

<script>
import UserCard from '../components/users/UserCard.vue';
import UserInfo from '../components/users/UserInfo.vue';
import NotificationsAccess from '../components/NotificationsAccess.vue';

export default {
    name: 'user-page',
    components: {
        UserCard,
        UserInfo,
        NotificationsAccess
    },
    watch:{
        filterValue: function(v){
            if(v.length > 2){
                this.filter();
            }else{
                this.limit += 0.01; //decimal activates the watch without actually affecting limit
            }
        },
        limit: function () {
            this.limit = Math.round(this.limit);
            this.pre = this.limit - 16;
            this.currentPage = this.limit / 16;
            if (this.users) {
                if (this.limit >= this.allUsers.length) {
                    this.canShowOlder = false;
                }
                this.users = this.allUsers.slice(this.pre, this.limit);
            }
        }
    },
    methods: {
        showOlder: function () {
            if (this.canShowOlder && this.beatmaps) {
                this.limit += 16;
            }
        },
        showNewer: function () {
            if (this.pre > 0 && this.beatmaps) {
                this.limit -= 16;
                this.canShowOlder = true;
            }
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
                this.allUsers.sort((a, b) => {
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
                this.allUsers.sort((a, b) => {
                    if (this.asc) {
                        return a.username.toLowerCase().localeCompare(b.username.toLowerCase());
                    } else {
                        return b.username.toLowerCase().localeCompare(a.username.toLowerCase());
                    }
                });
            } else if (field == 'createdAt') {
                this.allUsers.sort((a, b) => {
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
            this.limit = 16.01;
        },
        //real functions
        switchInvites: async function(e){
            const u = await this.executePost('/users/switchInvites/', {}, e);
            if(u){
                this.updateUser(u);
            }
        },
        filter: function () {            
            this.filterValue = $("#search").val();
            this.users = this.allUsers;
            if(this.filterValue.length > 2){
                this.users = this.users.filter(u => {
                    if(u.username.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1){
                        return true;
                    }
                    return false;
                });
            }
        },
    },
    data() {
        return {
            users: null,
            allUsers: null,
            userId: null,
            beatmaps: null,
            filterValue: "",
            selectedUser: null,
            selectedMap: null,
            info: null,
            sortBy: null,
            asc: false,
            canShowOlder: true,
            pre: null,
            limit: null,
            pages: null,
            currentPage: null,
        }
    },
    created() {
        axios
            .get('/users/relevantInfo')
            .then(response => {
                this.users = response.data.users;
                this.allUsers = response.data.users;
                this.userId = response.data.userId;
                this.beatmaps = response.data.beatmaps;
                this.pre = 0;
                this.limit = 16;
                this.pages = Math.ceil(this.allUsers.length / this.limit);
                this.currentPage = 1;
                if (this.limit >= this.allUsers.length) {
                    this.canShowOlder = false;
                }
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
                    this.allUsers = response.data.users;
                    this.userId = response.data.userId;
                    this.beatmaps = response.data.beatmaps;
                    if(this.filterValue.length > 2){
                        this.filter();
                    }
                });
        }, 300000);
    }
}
</script>

<style>

</style>
