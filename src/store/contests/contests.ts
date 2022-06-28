import { Module } from 'vuex';
import { MainState } from '@store/main';
import { Contest } from '../../../interfaces/contest/contest';
import { Submission } from '../../../interfaces/contest/submission';

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
        addContest (state, contest: Contest): void {
            state.contests.unshift(contest);
            state.selectedContestId = contest.id;
        },
        deleteContest (state, id: string): void {
            state.selectedContestId = null;

            const contestIndex = state.contests.findIndex(s => s.id == id);

            if (contestIndex !== -1) {
                state.contests.splice(contestIndex, 1);
            }
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
        updateResultsUrl (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.resultsUrl = payload.resultsUrl;
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
        updateMode (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.mode = payload.mode;
            }
        },
        updateContestCriterias (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.criterias = payload.criterias;
            }
        },
        updateName (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.name = payload.name;
            }
        },
        updateDescription (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.description = payload.description;
            }
        },
        updateSubmissions (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                contest.submissions = payload.submissions;
            }
        },
        updateAnonymousSubmissionName (state, payload): void {
            const contest = state.contests.find(c => c.id == payload.contestId);

            if (contest) {
                const submissionIndex = contest.submissions.findIndex(s => s.id == payload.submissionId);

                if (submissionIndex !== -1) {
                    contest.submissions[submissionIndex].name = payload.name;
                }
            }
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
            return state.contests.find(c => c.id === state.selectedContestId);
        },
        userSubmission: (state): Submission | undefined | null => {
            const contest = state.contests.find(c => c.id === state.selectedContestId);

            if (contest && contest.submissions && contest.submissions.length) {
                return contest.submissions[0];
            } else {
                return null;
            }
        },
    },
};

export default store;
