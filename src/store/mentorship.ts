import { Module } from 'vuex';
import { User } from '@interfaces/user';
import { MentorshipCycle } from '@interfaces/mentorshipCycle';
import { MainState } from './main';

interface UsersState {
    admins: User[];
    cycles: MentorshipCycle[];
    selectedCycleId: string | null;
    selectedUser: User | null;
    showPhases: boolean;
    badgeUsers: any[];
}

const store: Module<UsersState, MainState> = {
    namespaced: true,
    state: {
        admins: [],
        cycles: [],
        selectedCycleId: null,
        selectedUser: null,
        showPhases: false,
        badgeUsers: [],
    },
    mutations: {
        setAdmins (state, admins: User[]): void {
            state.admins = admins;
        },
        setBadgeUsers (state, badgeUsers: any[]): void {
            state.badgeUsers = badgeUsers;
        },
        setCycles (state, cycles: MentorshipCycle[]): void {
            state.cycles = cycles;
        },
        removeAdmin (state, userId: User['id']): void {
            const adminIndex = state.admins.findIndex(a => a.id == userId);

            if (adminIndex !== -1) {
                state.admins.splice(adminIndex, 1);
            }
        },
        setSelectedCycleId (state, cycleId: string): void {
            state.selectedCycleId = cycleId;
        },
        updateCycle (state, cycle: MentorshipCycle): void {
            const i = state.cycles.findIndex(c => c.id === cycle.id);
            if (i !== -1) state.cycles[i] = cycle;
        },
        setSelectedUser (state, user: User): void {
            state.selectedUser = user;
        },
        toggleShowPhases (state): void {
            state.showPhases = !state.showPhases;
        },
    },
    getters: {
        allAdmins: (state): User[] => {
            return state.admins;
        },
        badgeUsers: (state): any[] => {
            return state.badgeUsers;
        },
        allCycles: (state): MentorshipCycle[] => {
            return state.cycles;
        },
        selectedCycle: (state): MentorshipCycle | undefined => {
            return state.cycles.find(c => c.id === state.selectedCycleId);
        },
    },
};

export default store;
