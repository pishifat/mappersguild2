<template>
    <div>
        <div class="container bg-container py-3 mb-2">
            <filter-box
                :filterValue.sync="filterValue"
                :filterMode.sync="filterMode"
                @self-filter="selfFilter()"
            ></filter-box>
            <div class="row small mt-3">
                <div class="col-auto filter-title">
                    Sort
                </div>
                <div class="col">
                    <a
                        :class="sortBy === 'username' ? 'sorted' : 'unsorted'"
                        href="#"
                        @click.prevent="sort('username')"
                        >Name</a
                    >
                    <a
                        :class="sortBy === 'rank' ? 'sorted' : 'unsorted'"
                        href="#"
                        @click.prevent="sort('rank')"
                        >Rank</a
                    >
                    <a
                        :class="sortBy === 'createdAt' ? 'sorted' : 'unsorted'"
                        href="#"
                        @click.prevent="sort('createdAt')"
                        >Joined</a
                    >
                </div>
            </div>
        </div>

        <div class="container bg-container py-3">
            <button
                :disabled="!(pre > 0)"
                class="btn btn-sm btn-mg mx-auto my-2"
                style="display:block"
                type="button"
                @click="showNewer()"
            >
                <i class="fas fa-angle-up mr-1"></i> show newer
                <i class="fas fa-angle-up ml-1"></i>
            </button>
            <div>
                <transition-group name="list" tag="div" class="row">
                    <user-card
                        v-for="user in users"
                        :key="user.id"
                        :user="user"
                        :filterMode="filterMode"
                        @update:selectedUser="selectedUser = $event"
                    ></user-card>
                </transition-group>
                <div class="small text-center mx-auto">{{ currentPage }} of {{ pages }}</div>
                <button
                    :disabled="!canShowOlder"
                    class="btn btn-sm btn-mg mx-auto my-2"
                    style="display:block"
                    type="button"
                    @click="showOlder()"
                >
                    <i class="fas fa-angle-down mr-1"></i> show older
                    <i class="fas fa-angle-down ml-1"></i>
                </button>
            </div>
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
import FilterBox from '../components/FilterBox.vue';
import NotificationsAccess from '../components/NotificationsAccess.vue';

export default {
    name: 'user-page',
    components: {
        UserCard,
        UserInfo,
        NotificationsAccess,
        FilterBox,
    },
    watch: {
        filterValue: function(v) {
            this.filter();
        },
        filterMode: function(v) {
            this.filter();
        },
        limit: function() {
            this.limit = Math.round(this.limit);
            this.pre = this.limit - 16;
            if (this.allUsers) {
                if (this.isFiltered) {
                    if (this.limit >= this.filteredUsers.length) {
                        this.canShowOlder = false;
                    }
                    this.users = this.filteredUsers.slice(this.pre, this.limit);
                    this.pages = Math.ceil(this.filteredUsers.length / 16);
                } else {
                    if (this.limit >= this.allUsers.length) {
                        this.canShowOlder = false;
                    }
                    this.users = this.allUsers.slice(this.pre, this.limit);
                    this.pages = Math.ceil(this.allUsers.length / 16);
                }
            }
            if (this.pages > 0) {
                this.currentPage = this.limit / 16;
            } else {
                this.currentPage = this.pages;
            }
        },
    },
    methods: {
        showOlder: function() {
            if (this.canShowOlder) {
                this.limit += 16;
            }
        },
        showNewer: function() {
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
        sort: function(field, keepOrder) {
            this.sortBy = field;
            if (!keepOrder) {
                this.asc = !this.asc;
            }

            if (this.sortBy == 'rank') {
                if (this.isFiltered) {
                    if (this.filterMode == 'osu') {
                        this.filteredUsers.sort((a, b) => {
                            if (this.asc) {
                                if (a.osuPoints > b.osuPoints) return -1;
                                if (a.osuPoints < b.osuPoints) return 1;
                            } else {
                                if (a.osuPoints < b.osuPoints) return -1;
                                if (a.osuPoints > b.osuPoints) return 1;
                            }
                            return 0;
                        });
                    } else if (this.filterMode == 'taiko') {
                        this.filteredUsers.sort((a, b) => {
                            if (this.asc) {
                                if (a.taikoPoints > b.taikoPoints) return -1;
                                if (a.taikoPoints < b.taikoPoints) return 1;
                            } else {
                                if (a.taikoPoints < b.taikoPoints) return -1;
                                if (a.taikoPoints > b.taikoPoints) return 1;
                            }
                            return 0;
                        });
                    } else if (this.filterMode == 'catch') {
                        this.filteredUsers.sort((a, b) => {
                            if (this.asc) {
                                if (a.catchPoints > b.catchPoints) return -1;
                                if (a.catchPoints < b.catchPoints) return 1;
                            } else {
                                if (a.catchPoints < b.catchPoints) return -1;
                                if (a.catchPoints > b.catchPoints) return 1;
                            }
                            return 0;
                        });
                    } else if (this.filterMode == 'mania') {
                        this.filteredUsers.sort((a, b) => {
                            if (this.asc) {
                                if (a.maniaPoints > b.maniaPoints) return -1;
                                if (a.maniaPoints < b.maniaPoints) return 1;
                            } else {
                                if (a.maniaPoints < b.maniaPoints) return -1;
                                if (a.maniaPoints > b.maniaPoints) return 1;
                            }
                            return 0;
                        });
                    } else {
                        this.filteredUsers.sort((a, b) => {
                            if (this.asc) {
                                if (a.totalPoints > b.totalPoints) return -1;
                                if (a.totalPoints < b.totalPoints) return 1;
                            } else {
                                if (a.totalPoints < b.totalPoints) return -1;
                                if (a.totalPoints > b.totalPoints) return 1;
                            }
                            return 0;
                        });
                    }
                } else {
                    this.allUsers.sort((a, b) => {
                        if (this.asc) {
                            if (a.totalPoints > b.totalPoints) return -1;
                            if (a.totalPoints < b.totalPoints) return 1;
                        } else {
                            if (a.totalPoints < b.totalPoints) return -1;
                            if (a.totalPoints > b.totalPoints) return 1;
                        }
                        return 0;
                    });
                }
            } else if (this.sortBy == 'username') {
                if (this.isFiltered) {
                    this.filteredUsers.sort((a, b) => {
                        if (this.asc) {
                            return a.username.toLowerCase().localeCompare(b.username.toLowerCase());
                        } else {
                            return b.username.toLowerCase().localeCompare(a.username.toLowerCase());
                        }
                    });
                } else {
                    this.allUsers.sort((a, b) => {
                        if (this.asc) {
                            return a.username.toLowerCase().localeCompare(b.username.toLowerCase());
                        } else {
                            return b.username.toLowerCase().localeCompare(a.username.toLowerCase());
                        }
                    });
                }
            } else if (this.sortBy == 'createdAt') {
                if (this.isFiltered) {
                    this.filteredUsers.sort((a, b) => {
                        if (this.asc) {
                            if (a.createdAt > b.createdAt) return 1;
                            if (a.createdAt < b.createdAt) return -1;
                        } else {
                            if (a.createdAt < b.createdAt) return 1;
                            if (a.createdAt > b.createdAt) return -1;
                        }
                        return 0;
                    });
                } else {
                    this.allUsers.sort((a, b) => {
                        if (this.asc) {
                            if (a.createdAt > b.createdAt) return 1;
                            if (a.createdAt < b.createdAt) return -1;
                        } else {
                            if (a.createdAt < b.createdAt) return 1;
                            if (a.createdAt > b.createdAt) return -1;
                        }
                        return 0;
                    });
                }
            }
            this.limit = 16.01;
            this.canShowOlder = true;
        },
        //real functions
        switchInvites: async function(e) {
            const u = await this.executePost('/users/switchInvites/', {}, e);
            if (u) {
                this.updateUser(u);
            }
        },
        selfFilter: function() {
            this.filterValue = this.username;
            this.filter();
        },
        filter: function() {
            this.users = this.allUsers;

            //search
            if (this.filterValue.length > 2) {
                this.filteredUsers = this.allUsers.filter(u => {
                    if (u.username.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1) {
                        return true;
                    }
                    return false;
                });
            }

            //mode
            if (this.filterMode.length) {
                if (this.filterValue.length > 2) {
                    this.filteredUsers = this.filteredUsers.filter(u => {
                        if (this.filterMode == 'osu' && u.osuPoints) {
                            return true;
                        }
                        if (this.filterMode == 'taiko' && u.taikoPoints) {
                            return true;
                        }
                        if (this.filterMode == 'catch' && u.catchPoints) {
                            return true;
                        }
                        if (this.filterMode == 'mania' && u.maniaPoints) {
                            return true;
                        }
                        return false;
                    });
                } else {
                    this.filteredUsers = this.allUsers.filter(u => {
                        if (this.filterMode == 'osu' && u.osuPoints) {
                            return true;
                        }
                        if (this.filterMode == 'taiko' && u.taikoPoints) {
                            return true;
                        }
                        if (this.filterMode == 'catch' && u.catchPoints) {
                            return true;
                        }
                        if (this.filterMode == 'mania' && u.maniaPoints) {
                            return true;
                        }
                        return false;
                    });
                }
            }

            this.isFiltered = this.filterValue.length > 2 || this.filterMode.length;
            if (this.sortBy) {
                this.sort(this.sortBy, true);
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
            username: null,
            beatmaps: null,
            filterValue: '',
            filterMode: '',
            isFiltered: false,
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
        };
    },
    created() {
        axios
            .get('/users/relevantInfo')
            .then(response => {
                this.allUsers = response.data.users;
                this.userId = response.data.userId;
                this.username = response.data.username;
                this.beatmaps = response.data.beatmaps;
                this.limit = 16;
            })
            .then(function() {
                $('#loading').fadeOut();
                $('#app')
                    .attr('style', 'visibility: visible')
                    .hide()
                    .fadeIn();
            });
    },
    mounted() {
        setInterval(() => {
            axios.get('/users/relevantInfo').then(response => {
                this.allUsers = response.data.users;
                this.userId = response.data.userId;
                this.username = response.data.username;
                this.beatmaps = response.data.beatmaps;
                if (this.isFiltered) {
                    this.filter();
                }
            });
        }, 300000);
    },
};
</script>

<style>
</style>
