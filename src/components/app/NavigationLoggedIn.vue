<template>
    <div id="navbar" class="collapse navbar-collapse">
        <navigation-always-visible />
        <ul class="navbar-nav">
            <template v-if="isAdmin">
                <li class="nav-item dropdown">
                    <a
                        id="adminDropdown"
                        class="nav-link dropdown-toggle"
                        data-bs-toggle="dropdown"
                        href="#"
                    >
                        Admin
                    </a>
                    <ul class="dropdown-menu">
                        <li>
                            <router-link class="dropdown-item" to="/admin/summary">
                                Summary
                            </router-link>
                        </li>
                        <li>
                            <router-link class="dropdown-item" to="/admin/beatmaps">
                                Beatmaps
                            </router-link>
                        </li>
                        <li>
                            <router-link class="dropdown-item" to="/admin/featuredArtists">
                                Featured Artists
                            </router-link>
                        </li>
                        <li>
                            <router-link class="dropdown-item" to="/admin/quests">
                                Quests
                            </router-link>
                        </li>
                        <li>
                            <router-link class="dropdown-item" to="/admin/missions">
                                Priority Quests (Missions)
                            </router-link>
                        </li>
                        <li>
                            <router-link class="dropdown-item" to="/admin/users">
                                Users
                            </router-link>
                        </li>
                    </ul>
                </li>
            </template>
            <li v-if="isMentorshipAdmin || isAdmin" class="nav-item">
                <router-link class="nav-link" to="/mentorship">
                    Mentorship
                </router-link>
            </li>
            <li v-if="isWorldCupHelper || isAdmin" class="nav-item">
                <router-link class="nav-link" to="/worldCup">
                    World Cup
                </router-link>
            </li>
            <li v-if="isSecret || isAdmin" class="nav-item">
                <router-link class="nav-link" to="/showcase">
                    FA Showcase
                </router-link>
            </li>
            <li v-if="isPishifat" class="nav-item">
                <router-link class="nav-link" to="/artists">
                    FA Schedule
                </router-link>
            </li>
        </ul>

        <navigation-user-menu />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import NavigationAlwaysVisible from './NavigationAlwaysVisible.vue';
import NavigationUserMenu from './NavigationUserMenu.vue';

export default defineComponent({
    components: {
        NavigationAlwaysVisible,
        NavigationUserMenu,
    },
    computed: {
        ...mapState([
            'loggedInUser',
            'initialized',
        ]),
        isAdmin () {
            return this.loggedInUser.group === 'admin';
        },
        isMentorshipAdmin () {
            return this.loggedInUser.isMentorshipAdmin;
        },
        isWorldCupHelper () {
            return this.loggedInUser.isWorldCupHelper;
        },
        isPishifat () {
            return this.loggedInUser.osuId === 3178418;
        },
        isSecret () {
            return this.loggedInUser.group === 'secret';
        },
    },
    methods: {
        async toggleIsShowcaseMapper() {
            const user = await this.$http.executePost('/toggleIsShowcaseMapper', { value: !this.loggedInUser.isShowcaseMapper });

            if (user) {
                this.$store.commit('updateLoggedInUser', user);
            }
        },
        async toggleIsContestHelper() {
            const user = await this.$http.executePost('/toggleIsContestHelper', { value: !this.loggedInUser.isContestHelper });

            if (user) {
                this.$store.commit('updateLoggedInUser', user);
            }
        },
    },
});
</script>