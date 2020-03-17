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
const usersRouter = express_1.default.Router();
usersRouter.use(middlewares_1.isLoggedIn);
const beatmapPopulate = [
    { path: 'song', select: 'artist title' },
    { path: 'host', select: 'username osuId' },
    { path: 'tasks', populate: { path: 'mappers' } },
];
const questPopulate = [
    { path: 'currentParty', populate: { path: 'members leader' } },
];
usersRouter.get('/', (req, res) => {
    var _a, _b;
    res.render('users', {
        title: 'Users',
        script: 'users.js',
        isUsers: true,
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});
usersRouter.get('/relevantInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const u = yield user_1.UserService.queryAll({
        query: {
            group: { $ne: 'spectator' },
        },
        useDefaults: true,
    });
    res.json({
        users: u,
        userId: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        username: (_b = req.session) === null || _b === void 0 ? void 0 : _b.username,
        group: res.locals.userRequest.group,
    });
}));
usersRouter.get('/beatmaps', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const b = yield beatmap_1.BeatmapService.queryAll({
        populate: beatmapPopulate,
        sort: { status: -1 },
    });
    res.json({ beatmaps: b });
}));
usersRouter.get('/findCurrentQuests/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const wipQuests = yield quest_1.QuestService.queryAll({
        query: { status: 'wip' },
        populate: questPopulate,
        sort: { accepted: -1 },
    });
    const currentQuests = [];
    if (!quest_1.QuestService.isError(wipQuests)) {
        wipQuests.forEach(quest => {
            quest.currentParty.members.forEach(member => {
                if (member.id == req.params.id) {
                    currentQuests.push(quest);
                }
            });
        });
    }
    res.json({ currentQuests });
}));
usersRouter.get('/:sort', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield user_1.UserService.queryAll({
        query: {
            group: { $ne: 'spectator' },
        },
        defaultPopulate: true,
        sort: req.params.sort,
    }));
}));
exports.default = usersRouter;
