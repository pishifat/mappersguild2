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
const invite_1 = require("../models/invite");
const notification_1 = require("../models/notification");
const notificationsRouter = express_1.default.Router();
notificationsRouter.use(middlewares_1.isLoggedIn);
notificationsRouter.use(middlewares_1.isUser);
const notificationPopulate = [
    { path: 'sender', select: 'username osuId' },
    {
        path: 'map',
        populate: [
            { path: 'song' },
            { path: 'host' },
            {
                path: 'tasks', populate: { path: 'mappers' },
            },
        ],
    },
    { path: 'party', populate: { path: 'members leader' } },
    { path: 'quest', select: 'name' },
];
const invitePopulate = [
    { path: 'sender', select: 'username osuId' },
    {
        path: 'map',
        populate: [
            { path: 'song' },
            { path: 'host' },
            {
                path: 'tasks', populate: { path: 'mappers' },
            },
        ],
    },
    { path: 'party', populate: { path: 'members leader' } },
    {
        path: 'quest',
        populate: {
            path: 'parties', populate: { path: 'members' },
        },
    },
];
notificationsRouter.get('/relevantInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const [notifications, invites] = yield Promise.all([
        notification_1.NotificationModel
            .find({
            visible: true,
            recipient: (_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId,
        })
            .populate(notificationPopulate),
        invite_1.InviteModel
            .find({
            visible: true,
            recipient: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        })
            .populate(invitePopulate),
    ]);
    res.json({ notifications, invites });
}));
notificationsRouter.post('/:id/hide', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notification_1.NotificationModel.findById(req.params.id).orFail();
    notification.visible = false;
    yield notification.save();
    res.json(notification);
}));
notificationsRouter.post('/hideAll/', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const notifications = yield notification_1.NotificationModel
        .find({
        recipient: (_c = req.session) === null || _c === void 0 ? void 0 : _c.mongoId,
        visible: true,
    })
        .orFail();
    for (const notification of notifications) {
        notification.visible = false;
        notification.save();
    }
    res.json({});
}));
exports.default = notificationsRouter;
