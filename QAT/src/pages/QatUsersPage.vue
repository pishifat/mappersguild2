<template>
<div class="row">
    <div class="col-md-12">
        <div class="row mb-3">
            <div class="col-lg-5 col-md-7">
                <small>Search: 
                    <input id="search" class="text-input" v-model="filterValue" type="text" placeholder="username... (3+ characters)" /> 
                </small>
                <small>
                <select class="custom-select inline-custom-select ml-2" id="mode" v-model="filterMode">
                    <option value="" selected>All modes</option>
                    <option value="osu">osu!</option>
                    <option value="taiko">osu!taiko</option>
                    <option value="catch">osu!catch</option>
                    <option value="mania">osu!mania</option>
                </select>
                </small>
            </div>
            <div class="col-lg-3 col-md-3">
                <small class="pl-1">Sort: 
                    <a :class="sortBy === 'username' ? 'sorted' : ''" href="#" @click.prevent="sort('username')">Name</a> |
                    <a :class="sortBy === 'createdAt' ? 'sorted' : ''" href="#" @click.prevent="sort('createdAt')">Joined</a>
                </small>
            </div>
        </div>

        <button :disabled="!(pre > 0)" class="btn btn-sm btn-qat mx-auto my-2" style="display:block" type="button" @click="showNewer()">
            <i class="fas fa-angle-up mr-1"></i> show next <i class="fas fa-angle-up ml-1"></i>
        </button>
        <transition-group name="list" tag="div" class="row">
            <qat-user-card
                v-for="user in users"
                :key="user.id"
                :user="user"
                :userId="userId"
                :userGroup="userGroup"
                @update:selectedUser="selectedUser = $event"
            ></qat-user-card>
        </transition-group>
        <div class="small text-center mx-auto">{{currentPage}} of {{pages}}</div>
        <button :disabled="!canShowOlder" class="btn btn-sm btn-qat mx-auto my-2" style="display:block" type="button" @click="showOlder()">
            <i class="fas fa-angle-down mr-1"></i> show previous <i class="fas fa-angle-down ml-1"></i>
        </button>
    </div>
    <qat-user-info
        :user="selectedUser"
        :user-id="userId"
        :user-group="userGroup"
        @update-user="updateUser($event)"
    ></qat-user-info>

</div>
</template>

<script>
import QatUserCard from '../components/qatusers/QatUserCard.vue';
import QatUserInfo from '../components/qatusers/QatUserInfo.vue';

export default {
    name: 'qat-users-page',
    components: {
        QatUserCard,
        QatUserInfo, 
    },
    watch:{
        filterValue: function(v){
            this.filter();
        },
        filterMode: function(v) {
            this.filter();
        },
        limit: function () {
            this.limit = Math.round(this.limit);
            this.pre = this.limit - 16;
            if (this.allUsers) {
                if(this.isFiltered){
                    if (this.limit >= this.filteredUsers.length) {
                        this.canShowOlder = false;
                    }
                    this.users = this.filteredUsers.slice(this.pre, this.limit);
                    this.pages = Math.ceil(this.filteredUsers.length / 16);
                }else{
                    if (this.limit >= this.allUsers.length) {
                        this.canShowOlder = false;
                    }
                    this.users = this.allUsers.slice(this.pre, this.limit);
                    this.pages = Math.ceil(this.allUsers.length / 16);
                }
            }
            if(this.pages > 0){
                this.currentPage = this.limit / 16;
            }else{
                this.currentPage = this.pages;
            }
        },
    },
    methods: {
        showOlder: function () {
            if (this.canShowOlder) {
                this.limit += 16;
            }
        },
        showNewer: function () {
            if (this.pre > 0) {
                this.limit -= 16;
                this.canShowOlder = true;
            }
        },
        updateUser: function(u) {
			const i = this.users.findIndex(user => user.id == u.id);
			this.users[i] = u;
            this.selectedUser = u;
        },
        sort: function (field, keepOrder) {
            this.sortBy = field;
			if (!keepOrder) {
				this.asc = !this.asc;
            }
            if (this.sortBy == 'username') {
                if(this.isFiltered){
                    this.filteredUsers.sort((a, b) => {
                        if (this.asc) {
                            return a.username.toLowerCase().localeCompare(b.username.toLowerCase());
                        } else {
                            return b.username.toLowerCase().localeCompare(a.username.toLowerCase());
                        }
                    });
                }else{
                    this.allUsers.sort((a, b) => {
                        if (this.asc) {
                            return a.username.toLowerCase().localeCompare(b.username.toLowerCase());
                        } else {
                            return b.username.toLowerCase().localeCompare(a.username.toLowerCase());
                        }
                    });
                }
            } else if (this.sortBy == 'createdAt') {
                if(this.isFiltered){
                    this.filteredUsers.sort((a, b) => {
                        if (this.asc) {
                            if (a.createdAt > b.createdAt) return 1;
                            if (a.createdAt < b.createdAt) return -1;
                        } else {
                            if (a.createdAt < b.createdAt) return 1;
                            if (a.createdAt > b.createdAt) return -1
                        }
                        return 0;
                    });
                }else{
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
                
            }
            this.limit = 16.01;
            this.canShowOlder = true;
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
            this.filterMode = $("#mode").val();
            this.users = this.allUsers;

            //search
            if(this.filterValue.length > 2){
                this.filteredUsers = this.allUsers.filter(u => {
                    if(u.username.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1){
                        return true;
                    }
                    return false;
                });
            }
            
            //mode
            if(this.filterMode.length){
                if(this.filterValue.length > 2){
                    this.filteredUsers = this.filteredUsers.filter(u => {
                        if(this.filterMode == "osu" && u.modes.indexOf("osu") >= 0){
                            return true;
                        }
                        if(this.filterMode == "taiko" && u.modes.indexOf("taiko") >= 0){
                            return true;
                        }
                        if(this.filterMode == "catch" && u.modes.indexOf("catch") >= 0){
                            return true;
                        }
                        if(this.filterMode == "mania" && u.modes.indexOf("mania") >= 0){
                            return true;
                        }
                        return false;
                    });
                    
                }else{
                    this.filteredUsers = this.allUsers.filter(u => {
                        if(this.filterMode == "osu" && u.modes.indexOf("osu") >= 0){
                            return true;
                        }
                        if(this.filterMode == "taiko" && u.modes.indexOf("taiko") >= 0){
                            return true;
                        }
                        if(this.filterMode == "catch" && u.modes.indexOf("catch") >= 0){
                            return true;
                        }
                        if(this.filterMode == "mania" && u.modes.indexOf("mania") >= 0){
                            return true;
                        }
                        return false;
                    });
                }
            }
            
            this.isFiltered = (this.filterValue.length > 2 || this.filterMode.length);
            if(this.sortBy){
                this.sort(this.sortBy, true)
            }
            this.limit = 16.01; //resets to first page
            this.canShowOlder = true;
        },
    },
    data() {
        return {
            users: null,
            allUsers: null,
            filteredUsers: null,
            userId: null,
            userGroup: null,
            filterValue: "",
            filterMode: "",
            isFiltered: false,
            selectedUser: null,
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
            .get('/qat/qatusers/relevantInfo')
            .then(response => {
                this.allUsers = response.data.users;
                this.userId = response.data.userId;
                this.userGroup = response.data.userGroup;
                this.limit = 16;
            }).then(function(){
                $("#loading").fadeOut();
                $(".container").attr("style", "visibility: visible").hide().fadeIn();
            });
    },
    mounted () {
        setInterval(() => {
            axios
                .get('/users/relevantInfo')
                .then(response => {
                    this.allUsers = response.data.users;
                    if(this.isFiltered){
                        this.filter();
                    }
                });
        }, 300000);
    }
}
</script>

<style>

</style>
