<template>
    <div v-cloak id="app">
        <nav id="top" class="navbar navbar-expand-md navbar-dark bg-dark">
            <div class="container-fluid">
                <router-link class="navbar-brand" to="/">
                    <img src="/images/mg-icon.png" alt="">
                </router-link>

                <button
                    class="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbar"
                >
                    <span class="navbar-toggler-icon" />
                </button>

                <div id="navbar" class="collapse navbar-collapse">
                    <template v-if="loggedInUser">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <router-link class="nav-link" to="/beatmaps">
                                    Beatmaps
                                </router-link>
                            </li>
                            <li class="nav-item">
                                <router-link class="nav-link" to="/quests">
                                    Quests
                                </router-link>
                            </li>
                            <li class="nav-item">
                                <router-link class="nav-link" to="/users">
                                    Users
                                </router-link>
                            </li>
                            <li class="nav-item">
                                <router-link class="nav-link" to="/logs">
                                    Logs
                                </router-link>
                            </li>
                            <li class="nav-item">
                                <router-link class="nav-link" to="/faq">
                                    FAQ
                                </router-link>
                            </li>
                            <template v-if="loggedInUser.group === 'admin' || loggedInUser.group === 'secret'">
                                <li class="nav-item">
                                    <router-link class="nav-link" to="/showcase">
                                        Showcase
                                    </router-link>
                                </li>
                            </template>
                            <template v-if="loggedInUser.group === 'admin'">
                                <li class="nav-item">
                                    <router-link class="nav-link" to="/screening">
                                        Screening
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link class="nav-link" to="/judging">
                                        Judging
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link class="nav-link" to="/artists">
                                        Featured Artists
                                    </router-link>
                                </li>
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
                                            <router-link class="dropdown-item" to="/admin/contests">
                                                Contests
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
                                            <router-link class="dropdown-item" to="/admin/users">
                                                Users
                                            </router-link>
                                        </li>
                                    </ul>
                                </li>
                            </template>
                        </ul>

                        <div class="dropdown nav-avatar-menu">
                            <a
                                id="userInfo"
                                class="dropdown-toggle"
                                href="#"
                                data-bs-toggle="dropdown"
                            >
                                <img :src="`https://a.ppy.sh/${loggedInUser.osuId}`" class="rounded-circle nav-avatar ms-2">
                            </a>
                            <div class="dropdown-menu dropdown-menu-end">
                                <router-link :to="`/users?id=${loggedInUser.id}`" class="dropdown-item">
                                    View full points breakdown
                                </router-link>
                                <hr class="my-2">
                                <span class="dropdown-item disabled">Total points: <span class="float-end">{{ loggedInUser.pointsInfo.total }}</span></span>
                                <span class="dropdown-item disabled">Available points: <span class="float-end">{{ loggedInUser.pointsInfo.available }} <i class="fas fa-coins" /></span></span>
                                <hr class="my-2">
                                <span class="dropdown-item small disabled">Mapping points: <span class="float-end">{{ loggedInUser.pointsInfo.mapping }}</span></span>
                                <span class="dropdown-item small disabled">Modding points: <span class="float-end">{{ loggedInUser.pointsInfo.modding }}</span></span>
                                <span class="dropdown-item small disabled">Other points: <span class="float-end">{{ loggedInUser.pointsInfo.other }}</span></span>
                                <div class="dropdown-divider" />
                                <form action="/logout" method="GET">
                                    <button class="btn btn-sm btn-outline-danger float-end me-2" type="submit">
                                        Log Out
                                    </button>
                                </form>
                            </div>
                        </div>
                    </template>

                    <template v-else-if="initialized">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <router-link class="nav-link" to="/faq">
                                    FAQ
                                </router-link>
                            </li>
                        </ul>

                        <form
                            class="ms-auto me-3"
                            action="/login"
                            method="GET"
                        >
                            <button class="btn btn-sm btn-info" type="submit">
                                Log in
                            </button>
                        </form>
                    </template>
                </div>
            </div>
        </nav>

        <div class="container" style="min-height: 85vh">
            <div v-if="$route.path !== '/'" class="row justify-content-center my-2 py-3 page-content-header">
                <div class="col text-end pe-0">
                    <img
                        class="mx-3"
                        src="/images/mg-logo-text.png"
                        width="100"
                        height="100"
                    >
                </div>
                <div class="col ps-0 my-auto">
                    <h1>{{ title }}</h1>
                    <div class="linear-divisor mb-1" />
                </div>
            </div>

            <loading-page>
                <transition name="route-transition" mode="out-in">
                    <router-view />
                </transition>
            </loading-page>
        </div>

        <footer class="text-center mt-1">
            <div class="my-3">
                Mappers' Guild
            </div>
            <div class="footer-bar" />
        </footer>

        <toast-messages />
        <notifications-access v-if="loggedInUser && loggedInUser.group != 'spectator'" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import LoadingPage from '@components/LoadingPage.vue';
import ToastMessages from '@components/ToastMessages.vue';
import NotificationsAccess from '@components/NotificationsAccess.vue';

export default Vue.extend({
    components: {
        LoadingPage,
        ToastMessages,
        NotificationsAccess,
    },
    computed: {
        ...mapState([
            'loggedInUser',
            'initialized',
        ]),
        title () {
            return this.$route.meta.title;
        },
    },
});
</script>
