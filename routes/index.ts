import express from 'express';
import config from '../config.json';
import crypto from 'crypto';
import { UserModel } from '../models/user';
import { LogModel } from '../models/log';
import { LogCategory } from '../interfaces/log';
import { isLoggedIn } from '../helpers/middlewares';
import { getToken, getUserInfo, isOsuResponseError } from '../helpers/osuApi';
import { UserGroup } from '../interfaces/user';
import { webhookPost, webhookColors } from '../helpers/discordApi';
import { FeaturedArtistModel } from '../models/featuredArtist';
import { FeaturedArtistStatus } from '../interfaces/featuredArtist';

const indexRouter = express.Router();

/* GET landing page. */
indexRouter.get('/', async (req, res) => {
    const artists = await FeaturedArtistModel
        .aggregate()
        .match({ status: FeaturedArtistStatus.Public })
        .sort({ projectedRelease: -1 })
        .limit(6)
        .lookup({
            from: 'featuredsongs',
            let: { songs: '$songs' },
            pipeline: [
                { $match: { $expr: { $in: ['$_id', '$$songs'] } } },
                {
                    $lookup: {
                        from: 'beatmaps',
                        let: { id: '$_id' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$song', '$$id'] } } },
                            {
                                $lookup: {
                                    from: 'users',
                                    let: { host: '$host' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$host'] } } },
                                        { $project: { username: 1 } },
                                    ],
                                    as: 'host',
                                },
                            },
                            { $project: { url: 1, host: 1 } },
                            { $unwind: '$host' },
                        ],
                        as: 'beatmaps',
                    },
                },
                { $project: { beatmaps: 1, title: 1 } },
            ],
            as: 'songs',
        });

    let response: {} = {
        title: `Mappers' Guild`,
        isIndex: true,
        artists,
    };

    if (req.session?.osuId) {
        const u = await UserModel.findById(req.session.mongoId);

        if (u) {
            response = {
                ...response,
                loggedInAs: req.session?.osuId,
                isNotSpectator: u.group != UserGroup.Spectator,
                userMongoId: req.session?.mongoId,
                pointsInfo: u.pointsInfo,
            };
        }
    }

    res.render('index', response);
});

/* GET user's code to login */
indexRouter.get('/login', async (req, res, next) => {
    if (req.session?.osuId && req.session?.username) {
        const u = await UserModel.findOne({ osuId: req.session.osuId });

        if (!u) {
            const newUser = new UserModel();
            newUser.osuId = req.session.osuId;
            newUser.username = req.session.username;
            newUser.group = req.session.group;
            await newUser.save();

            if (newUser) {
                req.session.mongoId = newUser._id;

                if (newUser.group == UserGroup.User) {
                    webhookPost([{
                        author: {
                            name: newUser.username,
                            icon_url: `https://a.ppy.sh/${newUser.osuId}`,
                            url: `https://osu.ppy.sh/u/${newUser.osuId}`,
                        },
                        color: webhookColors.lightRed,
                        description: `Joined the Mappers' Guild!`,
                    }]);
                    LogModel.generate(req.session.mongoId, `joined the Mappers' Guild`, LogCategory.User);
                } else {
                    LogModel.generate(req.session.mongoId, `verified their account for the first time`, LogCategory.User);
                }

                return next();
            } else {
                return res.status(500).render('error', { message: 'Something went wrong!' });
            }
        } else {
            if (u.username != req.session.username) {
                u.username = req.session.username;
                await u.save();
            }

            if (u.group != req.session.group && u.group != UserGroup.Admin && u.group != UserGroup.Secret && !u.bypassLogin) {
                u.group = req.session.group;
                await u.save();

                if (req.session.group == UserGroup.User) {
                    webhookPost([{
                        author: {
                            name: u.username,
                            icon_url: `https://a.ppy.sh/${u.osuId}`,
                            url: `https://osu.ppy.sh/u/${u.osuId}`,
                        },
                        color: webhookColors.lightRed,
                        description: `Joined the Mappers' Guild!`,
                    }]);
                    LogModel.generate(u._id, `joined the Mappers' Guild`, LogCategory.User);
                }
            }

            req.session.mongoId = u._id;

            return next();
        }
    }

    if (!req.cookies._state) {
        crypto.randomBytes(48, function (err, buffer) {
            res.cookie('_state', buffer.toString('hex')); // , { httpOnly: true }
            res.redirect('/login');
        });
    } else {
        const hashedState = Buffer.from(req.cookies._state).toString('base64');
        res.redirect(`https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${config.id}&redirect_uri=${encodeURIComponent(config.redirect)}&state=${hashedState}&scope=identify`);
    }
}, isLoggedIn, (req, res) => {
    if (req?.session?.lastPage) {
        res.redirect(req.session.lastPage);
    } else if (res.locals.userRequest.group == UserGroup.Admin) {
        res.redirect('/artists');
    } else {
        res.redirect('/faq');
    }
});

/* GET logout, by deleting session */
indexRouter.get('/logout', isLoggedIn, (req, res) => {
    req.session?.destroy((error) => {
        console.log(error);

        return res.redirect('/');
    });
});

/* GET user's token and user's info to login */
indexRouter.get('/callback', async (req, res) => {
    if (!req.query.code || req.query.error || !req.query.state) {
        return res.redirect('/');
    }

    const decodedState = Buffer.from(req.query.state.toString(), 'base64').toString('ascii');

    if (decodedState !== req.cookies._state) {
        res.clearCookie('_state');

        return res.status(403).render('error', { message: 'unauthorized' });
    }

    let response = await getToken(req.query.code.toString());

    if (isOsuResponseError(response)) {
        res.status(500).render('error', { message: response.error });
    } else {
        // *1000 because maxAge is miliseconds, oauth is seconds
        req.session!.cookie.maxAge = response.expires_in * 1000;
        req.session!.accessToken = response.access_token;
        req.session!.refreshToken = response.refresh_token;

        response = await getUserInfo(req.session!.accessToken!);

        if (isOsuResponseError(response)) {
            res.status(500).render('error');
        } else {
            req.session!.group = response.ranked_and_approved_beatmapset_count >= 3 ? 'user' : 'spectator';
            req.session!.username = response.username;
            req.session!.osuId = response.id;
            res.redirect('/login');
        }
    }
});

export default indexRouter;
