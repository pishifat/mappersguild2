import { MainState } from '@store/main';
import { Module } from 'vuex';
import { User, UserGroup } from '../../../interfaces/user';

interface UserState {
    users: User[];
}

const store: Module<UserState, MainState> = {
    state: {
        users: [],
    },
    mutations: {
        setUsers (state, users: User[]): void {
            state.users = users;
        },
        updateBadge (state, payload): void {
            const user = state.users.find(u => u.id == payload.userId);

            if (user) {
                user.queuedBadge = payload.badge;
            }
        },
        updateLegacyPoints (state, payload): void {
            const user = state.users.find(u => u.id == payload.userId);

            if (user) {
                user.legacyPoints = payload.legacyPoints;
            }
        },
        updateDiscordId (state, payload): void {
            const user = state.users.find(u => u.id == payload.userId);

            if (user) {
                user.discordId = payload.discordId;
            }
        },
        updateIsMentorshipAdmin (state, payload): void {
            const user = state.users.find(u => u.id == payload.userId);

            if (user) {
                user.isMentorshipAdmin = payload.isMentorshipAdmin;
            }
        },
        updateHasMerchAccess (state, payload): void {
            const user = state.users.find(u => u.id == payload.userId);

            if (user) {
                user.hasMerchAccess = payload.hasMerchAccess;
            }
        },
        updateHasSpecificMerchOrder (state, payload): void {
            const user = state.users.find(u => u.id == payload.userId);

            if (user) {
                user.hasSpecificMerchOrder = payload.hasSpecificMerchOrder;
            }
        },
    },
    getters: {
        normalUsers: (state): Beatmap[] => {
            return state.users.filter(u => u.group == UserGroup.User);
        },
        adminUsers: (state): Beatmap[] => {
            return state.users.filter(u => u.group == UserGroup.Admin);
        },
        locusUsers: (state): Beatmap[] => {
            return state.users.filter(u => u.group == UserGroup.Locus);
        },
    },
};

export default store;
