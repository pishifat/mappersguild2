<template>
<div class="row">
    <div class="col-md-12">
        <h2>
            Vetoes listing 
            <button
                class="btn btn-mg"
                data-toggle="modal"
                data-target="#addVeto"
                @click="openSubmitVeto()"
            >Submit veto</button>
        </h2>
        <small>Search: 
            <input id="search" v-model="filterValue" type="text" placeholder="username... (3+ characters)" style="border-radius: 5px 5px 5px 5px; filter: drop-shadow(1px 1px 1px #000000); width: 200px;" /> 
        </small>
        <small>
        <select class="custom-select select-arrow-filter ml-2" id="mode" v-model="filterMode" style="border-radius: 5px 5px 5px 5px; width: 100px; padding: 0 0 0 0; height: 26px;">
            <option value="" selected>All modes</option>
            <option value="osu">osu!</option>
            <option value="taiko">osu!taiko</option>
            <option value="catch">osu!catch</option>
            <option value="mania">osu!mania</option>
        </select>
        </small>
        <small class="pl-1">Sort: 
            <a :class="sortBy === 'username' ? 'sorted' : ''" href="#" @click.prevent="sort('username')">Name</a> |
            <a :class="sortBy === 'createdAt' ? 'sorted' : ''" href="#" @click.prevent="sort('createdAt')">Joined</a>
        </small>
        
        <button :disabled="!(pre > 0)" class="btn btn-sm btn-mg mx-auto my-2" style="display:block" type="button" @click="showNewer()">
            <i class="fas fa-angle-up mr-1"></i> show next <i class="fas fa-angle-up ml-1"></i>
        </button>
        <transition-group name="list" tag="div" class="row">
            <veto-card
                v-for="veto in vetoes"
                :key="veto.id"
                :veto="veto"
                :userId="userId"
                :userGroup="userGroup"
                :filterMode="filterMode"
                @update:selectedVeto="selectedVeto = $event"
            ></veto-card>
        </transition-group>
        <div class="small text-center mx-auto">{{currentPage}} of {{pages}}</div>
        <button :disabled="!canShowOlder" class="btn btn-sm btn-mg mx-auto my-2" style="display:block" type="button" @click="showOlder()">
            <i class="fas fa-angle-down mr-1"></i> show previous <i class="fas fa-angle-down ml-1"></i>
        </button>
    </div>
    <veto-info
        :veto="selectedVeto"
        :user-id="userId"
        :user-group="userGroup"
        @update:selectedVeto="selectedVeto = $event"
        @update-veto="updateVeto($event)"
    ></veto-info>
    <submit-veto
    ></submit-veto>
</div>
</template>

<script>
import VetoCard from '../components/vetoes/VetoCard.vue';
import VetoInfo from '../components/vetoes/VetoInfo.vue';
import SubmitVeto from '../components/vetoes/SubmitVeto.vue';

export default {
    name: 'vetoes-page',
    components: {
        VetoCard,
        VetoInfo, 
        SubmitVeto,
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
            if (this.allVetoes) {
                if(this.isFiltered){
                    if (this.limit >= this.filteredUsers.length) {
                        this.canShowOlder = false;
                    }
                    this.vetoes = this.filteredUsers.slice(this.pre, this.limit);
                    this.pages = Math.ceil(this.filteredUsers.length / 16);
                }else{
                    if (this.limit >= this.allVetoes.length) {
                        this.canShowOlder = false;
                    }
                    this.vetoes = this.allVetoes.slice(this.pre, this.limit);
                    this.pages = Math.ceil(this.allVetoes.length / 16);
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
        openSubmitVeto: function() {
            //this.info = null;
        },
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
        updateVeto: function(v) {
			const i = this.vetoes.findIndex(veto => veto.id == v.id);
			this.vetoes[i] = v;
            this.selectedVeto = v;
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
                    this.allVetoes.sort((a, b) => {
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
                    this.allVetoes.sort((a, b) => {
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
            this.vetoes = this.allVetoes;

            //search
            if(this.filterValue.length > 2){
                this.filteredUsers = this.allVetoes.filter(u => {
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
                    this.filteredUsers = this.allVetoes.filter(u => {
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
            vetoes: null,
            allVetoes: null,
            filteredVetoes: null,
            userId: null,
            userGroup: null,
            filterValue: "",
            filterMode: "",
            isFiltered: false,
            selectedVeto: null,
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
            .get('/qat/vetoes/relevantInfo')
            .then(response => {
                this.allVetoes = response.data.vetoes;
                this.userId = response.data.userId;
                this.userGroup = response.data.userGroup;
                this.limit = 16;
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
                    this.allVetoes = response.data.vetoes;
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
