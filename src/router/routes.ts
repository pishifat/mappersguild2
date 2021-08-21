import Home from '../pages/Home.vue';
import Faq from '../pages/Faq.vue';
const Beatmaps = () => import('../pages/beatmaps/BeatmapPage.vue');
const Quests = () => import('../pages/quests/QuestPage.vue');
const Users = () => import('../pages/users/UserPage.vue');
const ContestResults = () => import('../pages/results/ContestResultsPage.vue');
const Error = () => import('../pages/Error.vue');
const NotFound = () => import('../pages/NotFound.vue');

const Logs = () => import('../pages/Logs.vue');
const Notifications = () => import('../pages/NotificationPage.vue');

const Judging = () => import('../pages/JudgingPage.vue');
const Screening = () => import('../pages/ScreeningPage.vue');
const Showcase = () => import('../pages/ShowcasePage.vue');

const Admin = () => import('../pages/AdminPage.vue');
const AdminBeatmaps = () => import('../pages/admin/BeatmapPage.vue');
const AdminContests = () => import('../pages/admin/ContestPage.vue');
const AdminFeaturedArtists = () => import('../pages/admin/FeaturedArtistPage.vue');
const AdminQuests = () => import('../pages/admin/QuestPage.vue');
const AdminUsers = () => import('../pages/admin/UserPage.vue');
const Artists = () => import('../pages/artists/ArtistPage.vue');

const routes = [
    // Public
    { path: '/', component: Home, alias: '/home' },
    { path: '/faq', component: Faq, meta: { title: 'FAQ' } },
    { path: '/beatmaps', component: Beatmaps, meta: { title: 'Beatmaps' } },
    { path: '/quests', component: Quests, meta: { title: 'Quests' } },
    { path: '/users', component: Users, meta: { title: 'Users' } },
    { path: '/contestResults', component: ContestResults, meta: { title: 'Contest Results' } },
    { path: '/error', component: Error, meta: { title: 'Oops' } },

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
