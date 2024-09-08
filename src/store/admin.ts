import { Module } from 'vuex';
import { MainState } from './main';
import { Beatmap, BeatmapStatus } from '@interfaces/beatmap/beatmap';
import { Quest } from '@interfaces/quest';
import { User } from '@interfaces/user';
import { Contest } from '@interfaces/contest/contest';
import { FeaturedArtist } from '@interfaces/featuredArtist';

interface AdminState {
    actionBeatmaps: Beatmap[];
    actionBeatmapsLoading: boolean;
    actionQuests: Quest[];
    actionQuestsLoading: boolean;
    actionUsers: User[];
    actionUsersLoading: boolean;
    actionContests: Contest[];
    actionContestsLoading: boolean;
    actionArtists: FeaturedArtist[];
    actionArtistsLoading: boolean;
    selectedBeatmap: null | Beatmap;
    selectedQuest: null | Quest;
    selectedUser: null | User;
    selectedContest: null | Contest;
    selectedArtist: null | FeaturedArtist;
}

const store: Module<AdminState, MainState> = {
    state: {
        actionBeatmaps: [],
        actionBeatmapsLoading: false,
        actionQuests: [],
        actionQuestsLoading: false,
        actionUsers: [],
        actionUsersLoading: false,
        actionContests: [],
        actionContestsLoading: false,
        actionArtists: [],
        actionArtistsLoading: false,
        selectedBeatmap: null,
        selectedQuest: null,
        selectedUser: null,
        selectedContest: null,
        selectedArtist: null,
    },
    mutations: {
        setActionBeatmaps (state, actionBeatmaps: Beatmap[]): void {
            state.actionBeatmaps = actionBeatmaps;
        },
        setActionBeatmapsLoading (state, value: boolean): void {
            state.actionBeatmapsLoading = value;
        },
        setActionQuests (state, actionQuests: Quest[]): void {
            state.actionQuests = actionQuests;
        },
        setActionQuestsLoading (state, value: boolean): void {
            state.actionQuestsLoading = value;
        },
        setActionUsers (state, actionUsers: User[]): void {
            state.actionUsers = actionUsers;
        },
        setActionUsersLoading (state, value: boolean): void {
            state.actionUsersLoading = value;
        },
        setActionContests (state, actionContests: Contest[]): void {
            state.actionContests = actionContests;
        },
        setActionContestsLoading (state, value: boolean): void {
            state.actionContestsLoading = value;
        },
        setActionArtists (state, actionArtists: FeaturedArtist[]): void {
            state.actionArtists = actionArtists;
        },
        setActionArtistsLoading (state, value: boolean): void {
            state.actionArtistsLoading = value;
        },
        setSelectedBeatmap (state, selectedBeatmap: Beatmap): void {
            state.selectedBeatmap = selectedBeatmap;
        },
        setSelectedQuest (state, selectedQuest: Quest): void {
            state.selectedQuest = selectedQuest;
        },
        setSelectedUser (state, selectedUser: User): void {
            state.selectedUser = selectedUser;
        },
        setSelectedContest (state, selectedContest: Contest): void {
            state.selectedContest = selectedContest;
        },
        setSelectedArtist (state, selectedArtist: FeaturedArtist): void {
            state.selectedArtist = selectedArtist;
        },

        // beatmaps
        updateBeatmap (state, beatmap: Beatmap): void {
            const i = state.actionBeatmaps.findIndex(b => b.id === beatmap.id);

            if (i !== -1) {
                state.actionBeatmaps[i] = beatmap;
                state.selectedBeatmap = beatmap;
            }
        },
        updateBeatmapStatus (state, payload): void {
            const beatmap = state.actionBeatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                beatmap.status = payload.status;

                if (beatmap.status == BeatmapStatus.Ranked) {
                    const i = state.actionBeatmaps.findIndex(b => b.id === payload.beatmapId);
                    state.actionBeatmaps.splice(i,1);
                }
            }
        },
        deleteTask (state, payload): void {
            const beatmap = state.actionBeatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                const i = beatmap.tasks.findIndex(t => t.id == payload.taskId);

                if (i !== -1) {
                    beatmap.tasks.splice(i, 1);
                }
            }
        },
        deleteModder (state, payload): void {
            const beatmap = state.actionBeatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                const i = beatmap.modders.findIndex(m => m.id == payload.modderId);

                if (i !== -1) {
                    beatmap.modders.splice(i, 1);
                }
            }
        },
        updateUrl (state, payload): void {
            const beatmap = state.actionBeatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                beatmap.url = payload.url;
            }
        },
        updatePackId (state, payload): void {
            const beatmap = state.actionBeatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                beatmap.packId = payload.packId;
            }
        },
        updateIsShowcase (state, payload): void {
            const beatmap = state.actionBeatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                beatmap.isShowcase = payload.isShowcase;
            }
        },
        updateIsWorldCup (state, payload): void {
            const beatmap = state.actionBeatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                beatmap.isWorldCup = payload.isWorldCup;
            }
        },
        updateQueuedForRank (state, payload): void {
            const beatmap = state.actionBeatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                beatmap.queuedForRank = payload.queuedForRank;
            }
        },
        updateSkipBeatmapWebhook (state, payload): void {
            const beatmap = state.actionBeatmaps.find(b => b.id == payload.beatmapId);

            if (beatmap) {
                beatmap.skipWebhook = payload.skipWebhook;
            }
        },

        // quests
        updateArt (state, payload): void {
            const quest = state.actionQuests.find(q => q.id == payload.questId);

            if (quest) {
                quest.art = payload.art;
            }
        },
        renameQuest (state, payload): void {
            const quest = state.actionQuests.find(q => q.id == payload.questId);

            if (quest) {
                quest.name = payload.name;
            }
        },
        updateDescription (state, payload): void {
            const quest = state.actionQuests.find(q => q.id == payload.questId);

            if (quest) {
                quest.descriptionMain = payload.description;
            }
        },
        updateRequiredMapsets (state, payload): void {
            const quest = state.actionQuests.find(q => q.id == payload.questId);

            if (quest) {
                quest.requiredMapsets = payload.requiredMapsets;
            }
        },
        updatePrice (state, payload): void {
            const quest = state.actionQuests.find(q => q.id == payload.questId);

            if (quest) {
                quest.price = payload.price;
            }
        },
        updateTimeframe (state, payload): void {
            const quest = state.actionQuests.find(q => q.id == payload.questId);

            if (quest) {
                quest.timeframe = payload.timeframe * (24*3600*1000);
            }
        },
        updateMinParty (state, payload): void {
            const quest = state.actionQuests.find(q => q.id == payload.questId);

            if (quest) {
                quest.minParty = payload.minParty;
            }
        },
        updateMaxParty (state, payload): void {
            const quest = state.actionQuests.find(q => q.id == payload.questId);

            if (quest) {
                quest.maxParty = payload.maxParty;
            }
        },
        updateStatus (state, payload): void {
            const quest = state.actionQuests.find(q => q.id == payload.questId);

            if (quest) {
                quest.status = payload.status;

                if (quest.status == 'open' || quest.status == 'rejected') {
                    const i = state.actionQuests.findIndex(q => q.id === payload.questId);
                    state.actionQuests.splice(i,1);
                }
            }
        },
        updateQueuedForCompletion (state, payload): void {
            const quest = state.actionQuests.find(q => q.id == payload.questId);

            if (quest) {
                quest.queuedForCompletion = payload.queuedForCompletion;
            }
        },

        // users
        updateGroup (state, payload): void {
            const user = state.actionUsers.find(u => u.id == payload.userId);

            if (user) {
                user.group = payload.group;
            }
        },
        updateQueuedBadge (state, payload): void {
            const user = state.actionUsers.find(u => u.id == payload.userId);

            if (user) {
                user.queuedBadge = payload.badge;
            }
        },
        updateBadge (state, payload): void {
            const user = state.actionUsers.find(u => u.id == payload.userId);

            if (user) {
                user.badge = payload.badge;
            }
        },
        updateDiscordId (state, payload): void {
            const user = state.actionUsers.find(u => u.id == payload.userId);

            if (user) {
                user.discordId = payload.discordId;
            }
        },

        // contests
        updateIsApproved (state, payload): void {
            const contest = state.actionContests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.isApproved = payload.isApproved;
            }
        },
        updateIsFeaturedArtistContest (state, payload): void {
            const contest = state.actionContests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.isFeaturedArtistContest = payload.isFeaturedArtistContest;
            }
        },
        updateIsEligibleForPoints (state, payload): void {
            const contest = state.actionContests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.isEligibleForPoints = payload.isEligibleForPoints;
            }
        },
        updateSkipWebhook (state, payload): void {
            const contest = state.actionContests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.skipWebhook = payload.skipWebhook;
            }
        },

        // artists
        updateNotes (state, payload): void {
            const artist = state.actionArtists.find(f => f.id == payload.featuredArtistId);

            if (artist) {
                artist.notes = payload.notes;
            }
        },
        updateLastReviewed (state, payload): void {
            const artist = state.actionArtists.find(f => f.id == payload.featuredArtistId);

            if (artist) {
                artist.lastReviewed = payload.lastReviewed;
            }
        },
        updatePermanentlyDismiss (state, payload): void {
            const artist = state.actionArtists.find(f => f.id == payload.featuredArtistId);

            if (artist) {
                artist.permanentlyDismiss = payload.permanentlyDismiss;
            }
        },
        removeFromActionArtists (state, payload): void {
            const i = state.actionArtists.findIndex(a => a.id == payload.featuredArtistId);

            if (i !== -1) {
                state.actionArtists.splice(i, 1);
            }
        },
    },
};

export default store;
