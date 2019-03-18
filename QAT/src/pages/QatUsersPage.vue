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
                v-for="user in pageObjs"
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
import pagination from '../mixins/pagination.js';
import filters from '../mixins/filters.js';
import postData from '../mixins/postData.js';

export default {
    name: 'qat-users-page',
    components: {
        QatUserCard,
        QatUserInfo, 
    },
    mixins: [postData, pagination, filters],
    methods: {
        filterBySearchValueContext: function(u) {
            if(u.username.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1){
                return true;
            }
            return false;
        },
        updateUser: function(u) {
			const i = this.pageObjs.findIndex(user => user.id == u.id);
			this.pageObjs[i] = u;
            this.selectedUser = u;
        },
        //real functions
        switchInvites: async function(e){
            const u = await this.executePost('/users/switchInvites/', {}, e);
            if(u){
                this.updateUser(u);
            }
        },
    },
    data() {
        return {
            pageObjs: null,
            allObjs: null,
            filteredObjs: null,
            userId: null,
            userGroup: null,
            selectedUser: null,
        }
    },
    created() {
        axios
            .get('/qat/qatusers/relevantInfo')
            .then(response => {
                this.allObjs = response.data.users;
                this.userId = response.data.userId;
                this.userGroup = response.data.userGroup;
                this.limit = 16;
            }).then(function(){
                $("#loading").fadeOut();
                $("#main").attr("style", "visibility: visible").hide().fadeIn();
            });
    },
    mounted () {
        setInterval(() => {
            axios
                .get('/users/relevantInfo')
                .then(response => {
                    this.allObjs = response.data.users;
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
