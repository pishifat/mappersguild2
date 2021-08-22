"use strict";
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
//populations
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
/* GET notifications/invites listing. */
notificationsRouter.get('/relevantInfo', async (req, res) => {
    const [notifications, invites] = await Promise.all([
        notification_1.NotificationModel
            .find({
            visible: true,
            recipient: req.session?.mongoId,
        })
            .populate(notificationPopulate),
        invite_1.InviteModel
            .find({
            visible: true,
            recipient: req.session?.mongoId,
        })
            .populate(invitePopulate),
    ]);
    res.json({ notifications, invites });
});
/* POST hide notification */
notificationsRouter.post('/:id/hide', async (req, res) => {
    const notification = await notification_1.NotificationModel.findById(req.params.id).orFail();
    notification.visible = false;
    await notification.save();
    res.json(notification);
});
/* POST hide all pending notifications */
notificationsRouter.post('/hideAll/', async (req, res) => {
    const notifications = await notification_1.NotificationModel
        .find({
        recipient: req.session?.mongoId,
        visible: true,
    })
        .orFail();
    for (const notification of notifications) {
        notification.visible = false;
        notification.save();
    }
    res.json({});
});
exports.default = notificationsRouter;
