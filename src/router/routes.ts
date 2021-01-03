import Home from '../pages/Home.vue';
import Faq from '../pages/Faq.vue';
const Beatmaps = () => import(/* webpackChunkName: "public", webpackPrefetch: true */ '../pages/beatmaps/BeatmapPage.vue');
const Quests = () => import(/* webpackChunkName: "public", webpackPrefetch: true */ '../pages/quests/QuestPage.vue');
const Users = () => import(/* webpackChunkName: "public", webpackPrefetch: true */ '../pages/users/UserPage.vue');
const ContestResults = () => import(/* webpackChunkName: "public", webpackPrefetch: true */ '../pages/ContestResultsPage.vue');
const NotFound = () => import(/* webpackChunkName: "public", webpackPrefetch: true */ '../pages/NotFound.vue');

const Logs = () => import(/* webpackChunkName: "logged", webpackPrefetch: true */ '../pages/Logs.vue');
const Notifications = () => import(/* webpackChunkName: "logged", webpackPrefetch: true */ '../pages/NotificationPage.vue');

const Judging = () => import(/* webpackChunkName: "limited", webpackPrefetch: true */ '../pages/JudgingPage.vue');
const Screening = () => import(/* webpackChunkName: "limited", webpackPrefetch: true */ '../pages/ScreeningPage.vue');
const Showcase = () => import(/* webpackChunkName: "limited", webpackPrefetch: true */ '../pages/ShowcasePage.vue');

const Admin = () => import(/* webpackChunkName: "admin", webpackPrefetch: true */ '../pages/AdminPage.vue');
const AdminBeatmaps = () => import(/* webpackChunkName: "admin", webpackPrefetch: true */ '../pages/admin/BeatmapPage.vue');
const AdminContests = () => import(/* webpackChunkName: "admin", webpackPrefetch: true */ '../pages/admin/ContestPage.vue');
const AdminFeaturedArtists = () => import(/* webpackChunkName: "admin", webpackPrefetch: true */ '../pages/admin/FeaturedArtistPage.vue');
const AdminQuests = () => import(/* webpackChunkName: "admin", webpackPrefetch: true */ '../pages/admin/QuestPage.vue');
const AdminUsers = () => import(/* webpackChunkName: "admin", webpackPrefetch: true */ '../pages/admin/UserPage.vue');
const Artists = () => import(/* webpackChunkName: "admin", webpackPrefetch: true */ '../pages/artists/ArtistPage.vue');

const routes = [
    // Public
    { path: '/', component: Home, alias: '/home' },
    { path: '/faq', component: Faq, meta: { title: 'FAQ' } },
    { path: '/beatmaps', component: Beatmaps, meta: { title: 'Beatmaps' } },
    { path: '/quests', component: Quests, meta: { title: 'Quests' } },
    { path: '/users', component: Users, meta: { title: 'Users' } },
    { path: '/contestResults', component: ContestResults, meta: { title: 'Contest Result' } },

    // Logged
    { path: '/logs', component: Logs, meta: { title: 'Logs' } },
    { path: '/notifications', component: Notifications, meta: { title: 'Notifications & Invites' } },

    // Limited Access
    { path: '/judging', component: Judging, meta: { title: 'Judging' } },
    { path: '/screening', component: Screening, meta: { title: 'Screening' } },
    { path: '/showcase', component: Showcase, meta: { title: 'FA Showcase Beatmaps' } },

    // Admin
    { path: '/admin/summary', component: Admin, meta: { title: 'Admin' } },
    { path: '/admin/beatmaps', component: AdminBeatmaps, meta: { title: 'Admin - Beatmaps' } },
    { path: '/admin/contests', component: AdminContests, meta: { title: 'Admin - Contests' } },
    { path: '/admin/featuredArtists', component: AdminFeaturedArtists, meta: { title: 'Admin - FA' } },
    { path: '/admin/quests', component: AdminQuests, meta: { title: 'Admin - Quests' } },
    { path: '/admin/users', component: AdminUsers, meta: { title: 'Admin - Users' } },
    { path: '/artists', component: Artists, meta: { title: 'Artists' } },

    // Fallback
    { path: '/:pathMatch(.*)*', component: NotFound, meta: { title: 'Oops' } },
];

export default routes;
