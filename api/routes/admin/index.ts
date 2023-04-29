import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { QuestModel } from '../../models/quest';
import { QuestStatus } from '../../../interfaces/quest';
import { UserModel } from '../../models/user';
import { BeatmapModel } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../../interfaces/beatmap/beatmap';
import { ContestModel } from '../../models/contest/contest';
import { ContestStatus } from '../../../interfaces/contest/contest';
import { getBeatmapsSearch, isOsuResponseError, getClientCredentialsGrant } from '../../helpers/osuApi';
import { FeaturedArtistModel } from '../../models/featuredArtist';


const adminRouter = express.Router();

adminRouter.use(isLoggedIn);
adminRouter.use(isAdmin);
adminRouter.use(isSuperAdmin);

/* GET beatmaps in need of action */
adminRouter.get('/loadActionBeatmaps/', async (req, res) => {
    const actionBeatmaps = await BeatmapModel
        .find({
            status: BeatmapStatus.Qualified,
            queuedForRank: { $ne: true },
        })
        .defaultPopulate()
        .sort({ updatedAt: 1 });

    res.json(actionBeatmaps);
});

/* GET quests in need of action */
adminRouter.get('/loadActionQuests/', async (req, res) => {
    let quests = await QuestModel
        .find({ status: QuestStatus.WIP })
        .defaultPopulate();

    quests = quests.filter(q =>
        q.associatedMaps.length >= q.requiredMapsets &&
        q.associatedMaps.every(b => b.status === BeatmapStatus.Ranked)
    );

    const pendingQuests = await QuestModel
        .find({ status: QuestStatus.Pending })
        .defaultPopulate();

    quests = quests.concat(pendingQuests);

    res.json(quests);
});

/* GET users in need of action */
adminRouter.get('/loadActionUsers/', async (req, res) => {
    const invalids = [5226970, 7496029]; // user IDs for people who specifically asked not to earn badges

    const allUsers = await UserModel.find({
        osuId: { $nin: invalids },
    });
    const actionUsers = allUsers.filter(u => u.badge !== u.rank);

    res.json(actionUsers);
});

/* GET contests in need of action */
adminRouter.get('/loadActionContests/', async (req, res) => {
    const actionContests = await ContestModel
        .find({
            isApproved: { $ne: true },
            status: { $ne: ContestStatus.Hidden },
        })
        .populate({ path: 'creators' });

    res.json(actionContests);
});

/* GET artists in need of action */
adminRouter.get('/loadActionArtists/', async (req, res) => {
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    const actionArtists = await FeaturedArtistModel
        .find({
            $or: [
                { lastReviewed: { $lt: oneYearAgo } },
                { lastReviewed: { $exists: false } },
            ],
            permanentlyDismiss: { $ne: true },
            osuId: { $exists: false },
        })
        .defaultPopulateWithSongs()
        .sort({ lastReviewed: -1, lastContacted: -1 });

    res.json(actionArtists);
});

/* POST update lastChecked */
adminRouter.get('/artistSearch/:input', async (req, res) => {
    const response = await getClientCredentialsGrant();

    if (isOsuResponseError(response)) {
        return res.json({ error: `Couldn't get client credentials.` });
    }

    const token = response.access_token;
    const searchResults = await getBeatmapsSearch(token, `?q=artist%3D"${req.params.input}"&s=any&sort=plays_desc`);

    res.json(searchResults);
});

export default adminRouter;
