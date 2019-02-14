var express = require('express');
var users = require('../models/user.js');
var notifications = require('../models/notification.js');
var invites = require('../models/invite.js');
var api = require('../models/api.js');

var router = express.Router();

router.use(api.isLoggedIn);

const defaultNotificationPopulate = [
    { populate: 'sender',  display: 'username osuId' },
    { innerPopulate: 'map',  populate: { path: 'song' } },
];
const defaultInvitePopulate = [
    { populate: 'sender',  display: 'username osuId' },
    { populate: 'map',  display: 'song' },
];

/* GET notifications */
router.get('/', async (req, res, next) => {
	res.render('notifications', { title: 'Notifications/Invites', script: '../javascripts/notifications.js', isNotifications: true, loggedInAs: req.session.username });
});

/* GET notifications/invites listing. */
router.get('/relevantInfo', async (req, res, next) => {

    let user = await users.service.query({ osuId: req.session.osuId });

    const [notif, inv] = await Promise.all([
        notifications.service.query({ visible: { $ne: false }, recipient: user._id}, defaultNotificationPopulate, {}, true),
        invites.service.query({ visible: { $ne: false }, recipient: user._id}, defaultInvitePopulate, {}, true)
    ]);
    res.json({notifications: notif, invites: inv});
  });

/* POST hide notification */
router.post('/hideNotification/:id', async (req, res) => {
    
    let n = await notifications.service.update(req.params.id, {visible: false});
    n = await notifications.service.query({_id: req.params.id}, defaultNotificationPopulate)
    res.json(n);
});

module.exports = router;
