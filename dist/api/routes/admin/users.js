"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const osuApi_1 = require("../../helpers/osuApi");
const user_1 = require("../../models/user");
const mission_1 = require("../../models/mission");
const points_1 = require("../../helpers/points");
const helpers_1 = require("../../helpers/helpers");
const adminUsersRouter = express_1.default.Router();
adminUsersRouter.use(middlewares_1.isLoggedIn);
adminUsersRouter.use(middlewares_1.isAdmin);
adminUsersRouter.use(middlewares_1.isSuperAdmin);
/* GET users */
adminUsersRouter.get('/load', async (req, res) => {
    const users = await user_1.UserModel.find({}).sort({ username: 1 });
    res.json(users);
});
/* GET search for one user */
adminUsersRouter.get('/searchUser/:userInput', async (req, res) => {
    const user = await user_1.UserModel
        .findOne()
        .byUsernameOrOsuId(req.params.userInput);
    res.json(user);
});
/* POST update user queuedBadge */
adminUsersRouter.post('/:id/updateQueuedBadge', async (req, res) => {
    const badge = parseInt(req.body.badge, 10);
    if (badge == 0) {
        await user_1.UserModel.findByIdAndUpdate(req.params.id, { queuedBadge: badge, badge }).orFail();
    }
    else {
        await user_1.UserModel.findByIdAndUpdate(req.params.id, { queuedBadge: badge }).orFail();
    }
    res.json(badge);
});
/* POST update user badge */
adminUsersRouter.post('/:id/updateBadge', async (req, res) => {
    const badge = parseInt(req.body.badge, 10);
    await user_1.UserModel.findByIdAndUpdate(req.params.id, { badge }).orFail();
    res.json(badge);
});
/* POST update legacy points */
adminUsersRouter.post('/:id/updateLegacyPoints', async (req, res) => {
    const legacyPoints = parseFloat(req.body.legacyPoints);
    await user_1.UserModel.findByIdAndUpdate(req.params.id, { legacyPoints }).orFail();
    res.json(legacyPoints);
});
/* POST update user group */
adminUsersRouter.post('/:id/updateGroup', async (req, res) => {
    await user_1.UserModel.findByIdAndUpdate(req.params.id, { group: req.body.group }).orFail();
    res.json(req.body.group);
});
/* POST update user discordId */
adminUsersRouter.post('/:id/updateDiscordId', async (req, res) => {
    await user_1.UserModel.findByIdAndUpdate(req.params.id, { discordId: req.body.discordId }).orFail();
    res.json(req.body.discordId);
});
/* POST calculate user points */
adminUsersRouter.post('/:id/calculateUserPoints', async (req, res) => {
    const points = await (0, points_1.updateUserPoints)(req.params.id);
    res.json(points);
});
/* POST toggle isMentorshipAdmin */
adminUsersRouter.post('/:id/toggleIsMentorshipAdmin', async (req, res) => {
    const isMentorshipAdmin = req.body.isMentorshipAdmin;
    await user_1.UserModel.findByIdAndUpdate(req.params.id, { isMentorshipAdmin }).orFail();
    res.json({ isMentorshipAdmin });
});
/* POST toggle isTeamContestAdmin */
adminUsersRouter.post('/:id/toggleIsTeamContestAdmin', async (req, res) => {
    const isTeamContestAdmin = req.body.isTeamContestAdmin;
    await user_1.UserModel.findByIdAndUpdate(req.params.id, { isTeamContestAdmin }).orFail();
    res.json({ isTeamContestAdmin });
});
/* POST toggle hasMerchAccess */
adminUsersRouter.post('/:id/toggleHasMerchAccess', async (req, res) => {
    const hasMerchAccess = req.body.hasMerchAccess;
    await user_1.UserModel.findByIdAndUpdate(req.params.id, { hasMerchAccess }).orFail();
    res.json({ hasMerchAccess });
});
/* POST toggle hasSpecificMerchOrder */
adminUsersRouter.post('/:id/toggleHasSpecificMerchOrder', async (req, res) => {
    const hasSpecificMerchOrder = req.body.hasSpecificMerchOrder;
    await user_1.UserModel.findByIdAndUpdate(req.params.id, { hasSpecificMerchOrder }).orFail();
    res.json({ hasSpecificMerchOrder });
});
/* POST update momentumStarterRole */
adminUsersRouter.post('/:id/updateMomentumStarterRole', async (req, res) => {
    const momentumStarterRole = req.body.momentumStarterRole || null;
    await user_1.UserModel.findByIdAndUpdate(req.params.id, { momentumStarterRole }).orFail();
    res.json({ momentumStarterRole });
});
/* POST reset hasMerchAccess */
adminUsersRouter.post('/resetMerchUsers', async (req, res) => {
    const osuIdInput = req.body.osuIdInput;
    const osuIdsSeparated = osuIdInput.split(',');
    const osuIds = osuIdsSeparated.map(id => id.trim());
    let query = {};
    switch (req.body.field) {
        case 'HasMerchAccess':
            query = { hasMerchAccess: true, osuId: { $nin: osuIds } };
            break;
        case 'HasSpecificMerchOrder':
            query = { hasSpecificMerchOrder: true, osuId: { $nin: osuIds } };
            break;
        default:
            return res.json({ error: 'no field' });
    }
    const users = await user_1.UserModel.find(query);
    for (const user of users) {
        switch (req.body.field) {
            case 'HasMerchAccess':
                user.hasMerchAccess = false;
                break;
            case 'HasSpecificMerchOrder':
                user.hasSpecificMerchOrder = false;
                break;
            default:
                return res.json({ error: 'no field' });
        }
        await user.save();
    }
    res.json(users.length);
});
/* POST loadMerchUsers */
adminUsersRouter.post('/loadMerchUsers', async (req, res) => {
    let query = {};
    switch (req.body.field) {
        case 'HasMerchAccess':
            query = { hasMerchAccess: true };
            break;
        case 'HasSpecificMerchOrder':
            query = { hasSpecificMerchOrder: true };
            break;
        default:
            return res.json({ error: 'no field' });
    }
    const users = await user_1.UserModel.find(query);
    res.json(users);
});
/* POST find input users for DiscordHighlightGenerator */
adminUsersRouter.post('/findInputUsers', async (req, res) => {
    const inputUsers = req.body.inputUsers;
    const usernames = inputUsers.split('\n');
    const users = [];
    for (const username of usernames) {
        const user = await user_1.UserModel.findOne({ username }).orFail();
        users.push(user);
    }
    res.json({ users });
});
/* POST search user through osu api */
adminUsersRouter.post('/searchUser', async (req, res) => {
    const osuId = parseInt(req.body.osuId);
    if (isNaN(osuId)) {
        return res.json({ error: 'invalid osu id' });
    }
    const response = await (0, osuApi_1.getClientCredentialsGrant)();
    if ((0, osuApi_1.isOsuResponseError)(response)) {
        return res.json(helpers_1.defaultErrorMessage);
    }
    const token = response.access_token;
    const userInfo = await (0, osuApi_1.getUserInfoFromId)(token, osuId);
    if ((0, osuApi_1.isOsuResponseError)(userInfo)) {
        return res.json(helpers_1.defaultErrorMessage);
    }
    res.json(userInfo);
});
/* GET classified missions for a user */
adminUsersRouter.get('/:id/classifiedMissions', async (req, res) => {
    const userId = req.params.id;
    const missions = await mission_1.MissionModel
        .find({ name: { $regex: 'Classified', $options: 'i' } })
        .populate([
        { path: 'showcaseMissionSongs.song', select: 'artist title' },
        { path: 'showcaseMissionSongs.user', select: 'id' },
        { path: 'showcaseMissionArtists.artist', select: 'label' },
        { path: 'showcaseMissionArtists.user', select: 'id' },
        { path: 'showcaseMissionSongsByGenre.songs', select: 'artist title' },
        { path: 'showcaseMissionSongsByGenre.user', select: 'id' },
    ])
        .sort({ createdAt: 1 });
    const result = missions.map(mission => {
        const m = mission.toObject();
        let userSelections = [];
        if (m.showcaseMissionSongs?.length) {
            const userEntries = m.showcaseMissionSongs.filter((entry) => entry.user?.id == userId || entry.user?._id?.toString() == userId);
            if (userEntries.length) {
                userSelections = userEntries.map((entry) => ({
                    type: 'song',
                    artist: entry.song?.artist,
                    title: entry.song?.title,
                }));
            }
        }
        if (m.showcaseMissionArtists?.length) {
            const userEntries = m.showcaseMissionArtists.filter((entry) => entry.user?.id == userId || entry.user?._id?.toString() == userId);
            if (userEntries.length) {
                userSelections = userSelections.concat(userEntries.map((entry) => ({
                    type: 'artist',
                    label: entry.artist?.label,
                })));
            }
        }
        if (m.showcaseMissionSongsByGenre?.length) {
            const userEntries = m.showcaseMissionSongsByGenre.filter((entry) => entry.user?.id == userId || entry.user?._id?.toString() == userId);
            if (userEntries.length) {
                for (const entry of userEntries) {
                    if (entry.songs?.length) {
                        userSelections = userSelections.concat(entry.songs.map((song) => ({
                            type: 'song',
                            artist: song.artist,
                            title: song.title,
                        })));
                    }
                }
            }
        }
        return {
            name: m.name,
            userSelections,
        };
    });
    res.json(result);
});
exports.default = adminUsersRouter;
