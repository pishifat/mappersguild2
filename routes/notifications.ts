import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { InviteModel } from '../models/invite';
import { NotificationModel } from '../models/notification';

const notificationsRouter = express.Router();

notificationsRouter.use(isLoggedIn);

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
        NotificationModel
            .find({
                visible: true,
                recipient: req.session?.mongoId,
            })
            .populate(notificationPopulate),

        InviteModel
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
    const notification = await NotificationModel.findById(req.params.id).orFail();
    notification.visible = false;
    await notification.save();

    res.json(notification);
});

/* POST hide all pending notifications */
notificationsRouter.post('/hideAll/', async (req, res) => {
    const notifications = await NotificationModel
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


export default notificationsRouter;
