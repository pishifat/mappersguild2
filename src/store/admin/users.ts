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
        updateDiscordId (state, payload): void {
            const user = state.users.find(u => u.id == payload.userId);

            if (user) {
                user.discordId = payload.discordId;
            }
        },
        updateIsShowcaseMapper (state, payload): void {
            const user = state.users.find(u => u.id == payload.userId);

            if (user) {
                user.isShowcaseMapper = payload.isShowcaseMapper;
            }
        },
        updateIsMentorshipAdmin (state, payload): void {
            const user = state.users.find(u => u.id == payload.userId);

            if (user) {
                user.isMentorshipAdmin = payload.isMentorshipAdmin;
            }
        },
        updateIsWorldCupHelper (state, payload): void {
            const user = state.users.find(u => u.id == payload.userId);

            if (user) {
                user.isWorldCupHelper = payload.isWorldCupHelper;
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
        updateWorldCupMerch (state, payload): void {
            const user = state.users.find(u => u.id == payload.userId);

            if (user) {
                user.worldCupMerch = payload.worldCupMerch;
            }
        },
    },
    getters: {
        normalUsers: (state): Beatmap[] => {
            return state.users.filter(u => u.group == UserGroup.User);
        },
        showcaseUsers: (state): Beatmap[] => {
            return state.users.filter(u => u.group == UserGroup.Secret);
        },
        adminUsers: (state): Beatmap[] => {
            return state.users.filter(u => u.group == UserGroup.Admin);
        },
    },
};

export default store;
