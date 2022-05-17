import { Module } from 'vuex';
import { MainState } from '@store/main';
import { Contest } from '../../../interfaces/contest/contest';

interface ContestState {
    contests: Contest[];
    selectedContestId: string | null;
}

const store: Module<ContestState, MainState> = {
    state: {
        contests: [],
        selectedContestId: null,
    },
    mutations: {
        setContests (state, contests: Contest[]): void {
            state.contests = contests;
        },
        setSelectedContestId (state, id: string): void {
            state.selectedContestId = id;
        },
        updateContestStart (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.contestStart = payload.contestStart;
            }
        },
        updateContestEnd (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.contestEnd = payload.contestEnd;
            }
        },
        updateUrl (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.url = payload.url;
            }
        },
        updateOsuContestListingUrl (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.osuContestListingUrl = payload.osuContestListingUrl;
            }
        },
        updateDownload (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.download = payload.download;
            }
        },
        deleteSubmission (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                const submissionIndex = contest.submissions.findIndex(s => s.id == payload.submissionId);

                if (submissionIndex !== -1) {
                    contest.submissions.splice(submissionIndex, 1);
                }
            }
        },
        addScreener (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);
            contest?.screeners.push(payload.screener);
        },
        deleteScreener (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                const screenerIndex = contest.screeners.findIndex(s => s.id == payload.screenerId);

                if (screenerIndex !== -1) {
                    contest.screeners.splice(screenerIndex, 1);
                }
            }
        },
        addJudge (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);
            contest?.judges.push(payload.judge);
        },
        deleteJudge (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                const judgeIndex = contest.judges.findIndex(s => s.id == payload.judgeId);

                if (judgeIndex !== -1) {
                    contest.judges.splice(judgeIndex, 1);
                }
            }
        },
        updateJudgingThreshold (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.judgingThreshold = payload.judgingThreshold;
            }
        },
        updateStatus (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.status = payload.status;
            }
        },
        updateContestCriterias (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.criterias = payload.criterias;
            }
        },










        addContest (state, contest: Contest): void {
            state.contests.unshift(contest);
        },
        /*addSubmissionsFromCsv (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.submissions = payload.submissions;
            }
        },*/
    },
    getters: {
        selectedContest: (state): Contest | undefined => {
            return state.contests.find(u => u.id === state.selectedContestId);
        },
    },
};

export default store;
