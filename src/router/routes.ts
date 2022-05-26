import Home from '../pages/Home.vue';
import Faq from '../pages/Faq.vue';

// Public
const Beatmaps = () => import('../pages/beatmaps/BeatmapPage.vue');
const Quests = () => import('../pages/quests/QuestPage.vue');
const Users = () => import('../pages/users/UserPage.vue');
const Error = () => import('../pages/Error.vue');
const NotFound = () => import('../pages/NotFound.vue');

// Logs
const Logs = () => import('../pages/Logs.vue');
const Notifications = () => import('../pages/NotificationPage.vue');

// Contests
const Judging = () => import('../pages/JudgingPage.vue');
const Screening = () => import('../pages/contests/ScreeningPage.vue');
const Listing = () => import('../pages/contests/ContestPage.vue');
const Results = () => import('../pages/contests/ContestResultsPage.vue');

// Admin
const Admin = () => import('../pages/AdminPage.vue');
const AdminBeatmaps = () => import('../pages/admin/BeatmapPage.vue');
const AdminFeaturedArtists = () => import('../pages/admin/FeaturedArtistPage.vue');
const AdminQuests = () => import('../pages/admin/QuestPage.vue');
const AdminUsers = () => import('../pages/admin/UserPage.vue');
const Artists = () => import('../pages/artists/ArtistPage.vue');

// Other
const Showcase = () => import('../pages/ShowcasePage.vue');

const routes = [
    // Public
    { path: '/', component: Home, alias: '/home' },
    { path: '/faq', component: Faq, meta: { title: 'FAQ' } },
    { path: '/beatmaps', component: Beatmaps, meta: { title: 'Beatmaps' } },
    { path: '/quests', component: Quests, meta: { title: 'Quests' } },
    { path: '/users', component: Users, meta: { title: 'Users' } },
    { path: '/error', component: Error, meta: { title: 'Oops' } },

    // Logs
    { path: '/logs', component: Logs, meta: { title: 'Logs' } },
    { path: '/notifications', component: Notifications, meta: { title: 'Notifications & Invites' } },

    // Contests
    { path: '/contests/listing', component: Listing, meta: { title: 'Contest Listing' } },
    { path: '/contests/results', component: Results, meta: { title: 'Contest Results' } },
    { path: '/judging', component: Judging, meta: { title: 'Judging' } },
    { path: '/contests/screening', component: Screening, meta: { title: 'Contest Screening' } },

    // Admin
    { path: '/admin/summary', component: Admin, meta: { title: 'Admin' } },
    { path: '/admin/beatmaps', component: AdminBeatmaps, meta: { title: 'Admin - Beatmaps' } },
    { path: '/admin/featuredArtists', component: AdminFeaturedArtists, meta: { title: 'Admin - FA' } },
    { path: '/admin/quests', component: AdminQuests, meta: { title: 'Admin - Quests' } },
    { path: '/admin/users', component: AdminUsers, meta: { title: 'Admin - Users' } },
    { path: '/artists', component: Artists, meta: { title: 'Artists' } },

    // Other
    { path: '/showcase', component: Showcase, meta: { title: 'FA Showcase Beatmaps' } },

    // Fallback
    { path: '/:pathMatch(.*)*', component: NotFound, meta: { title: 'Oops' } },
];

export default routes;
