import { Module } from 'vuex';
import { User } from '@interfaces/user';
import { MentorshipCycle } from '@interfaces/mentorshipCycle';
import { MainState } from './main';

interface UsersState {
    admins: User[];
    cycles: MentorshipCycle[];
    selectedCycleId: string | null;
    selectedUser: User | null;
}

const store: Module<UsersState, MainState> = {
    namespaced: true,
    state: {
        admins: [],
        cycles: [],
        selectedCycleId: null,
        selectedUser: null,
    },
    mutations: {
        setAdmins (state, admins: User[]): void {
            state.admins = admins;
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
    },
    getters: {
        allAdmins: (state): User[] => {
            return state.admins;
        },
        allCycles: (state): MentorshipCycle[] => {
            return state.cycles;
        },
        cycleOsuMentors: (state): User[] | undefined => {
            const cycleIndex = state.cycles.findIndex(c => c.id == state.selectedCycleId);

            if (cycleIndex !== -1) {
                return state.cycles[cycleIndex].osuMentors;
            }
        },
        cycleTaikoMentors: (state): User[] | undefined => {
            const cycleIndex = state.cycles.findIndex(c => c.id == state.selectedCycleId);

            if (cycleIndex !== -1) {
                return state.cycles[cycleIndex].taikoMentors;
            }
        },
        cycleCatchMentors: (state): User[] | undefined => {
            const cycleIndex = state.cycles.findIndex(c => c.id == state.selectedCycleId);

            if (cycleIndex !== -1) {
                return state.cycles[cycleIndex].catchMentors;
            }
        },
        cycleManiaMentors: (state): User[] | undefined => {
            const cycleIndex = state.cycles.findIndex(c => c.id == state.selectedCycleId);

            if (cycleIndex !== -1) {
                return state.cycles[cycleIndex].maniaMentors;
            }
        },
        cycleOsuMentees: (state): User[] | undefined => {
            const cycleIndex = state.cycles.findIndex(c => c.id == state.selectedCycleId);

            if (cycleIndex !== -1) {
                return state.cycles[cycleIndex].osuMentees;
            }
        },
        cycleTaikoMentees: (state): User[] | undefined => {
            const cycleIndex = state.cycles.findIndex(c => c.id == state.selectedCycleId);

            if (cycleIndex !== -1) {
                return state.cycles[cycleIndex].taikoMentees;
            }
        },
        cycleCatchMentees: (state): User[] | undefined => {
            const cycleIndex = state.cycles.findIndex(c => c.id == state.selectedCycleId);

            if (cycleIndex !== -1) {
                return state.cycles[cycleIndex].catchMentees;
            }
        },
        cycleManiaMentees: (state): User[] | undefined => {
            const cycleIndex = state.cycles.findIndex(c => c.id == state.selectedCycleId);

            if (cycleIndex !== -1) {
                return state.cycles[cycleIndex].maniaMentees;
            }
        },
        selectedCycle: (state): MentorshipCycle | undefined => {
            return state.cycles.find(c => c.id === state.selectedCycleId);
        },
    },
};

export default store;
