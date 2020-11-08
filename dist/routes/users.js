"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const user_1 = require("../models/user");
const beatmap_1 = require("../models/beatmap/beatmap");
const quest_1 = require("../models/quest");
const spentPoints_1 = require("../models/spentPoints");
const task_1 = require("../models/beatmap/task");
const quest_2 = require("../interfaces/quest");
const user_2 = require("../interfaces/user");
const beatmap_2 = require("../interfaces/beatmap/beatmap");
const usersRouter = express_1.default.Router();
usersRouter.use(middlewares_1.isLoggedIn);
const questPopulate = { path: 'currentParty', populate: { path: 'members leader' } };
const userPopulate = { path: 'completedQuests', select: 'name completed' };
usersRouter.get('/', (req, res) => {
    var _a, _b;
    res.render('users', {
        title: 'Users',
        script: 'users.js',
        isUsers: true,
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});
usersRouter.get('/relevantInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const users = yield user_1.UserModel
        .find({
        group: { $ne: user_2.UserGroup.Spectator },
    })
        .populate(userPopulate);
    res.json({
        users,
        userId: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        username: (_b = req.session) === null || _b === void 0 ? void 0 : _b.username,
        group: res.locals.userRequest.group,
    });
}));
usersRouter.get('/findCurrentQuests/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const wipQuests = yield quest_1.QuestModel
        .find({ status: quest_2.QuestStatus.WIP })
        .populate(questPopulate)
        .sort({ accepted: -1 });
    const currentQuests = wipQuests.filter(quest => quest.currentParty.members.some(member => member.id == req.params.id));
    res.json(currentQuests);
}));
usersRouter.get('/findCreatedQuests/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const createdQuests = yield quest_1.QuestModel
        .find({
        $or: [
            { status: { $ne: quest_2.QuestStatus.Hidden } },
            { status: { $ne: quest_2.QuestStatus.Rejected } },
        ],
        creator: req.params.id,
    })
        .distinct('name')
        .populate(questPopulate);
    res.json(createdQuests);
}));
usersRouter.get('/findSpentPoints/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const spentPoints = yield spentPoints_1.SpentPointsModel
        .find({ user: req.params.id })
        .populate({ path: 'quest', select: 'price art requiredMapsets name' })
        .sort({ createdAt: -1 });
    res.json(spentPoints);
}));
usersRouter.get('/findUserBeatmaps/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ownTasks = yield task_1.TaskModel
        .find({ mappers: req.params.id })
        .select('_id');
    const userBeatmaps = yield beatmap_1.BeatmapModel
        .find({
        status: { $ne: beatmap_2.BeatmapStatus.Secret },
        $or: [
            {
                tasks: {
                    $in: ownTasks,
                },
            },
            {
                host: req.params.id,
            },
        ],
    })
        .defaultPopulate()
        .sortByLastest();
    res.json(userBeatmaps);
}));
usersRouter.get('/:sort', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield user_1.UserModel
        .find({ group: { $ne: user_2.UserGroup.Spectator } })
        .populate(userPopulate)
        .sort(req.params.sort));
}));
exports.default = usersRouter;
