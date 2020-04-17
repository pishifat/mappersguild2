/* eslint-disable @typescript-eslint/no-non-null-assertion */
import express from 'express';
import config from '../config.json';
import crypto from 'crypto';
import { UserService } from '../models/user';
import { LogService } from '../models/log';
import { LogCategory } from '../interfaces/log';
import { isLoggedIn } from '../helpers/middlewares';
import { canFail } from '../helpers/helpers';
import { getToken, getUserInfo, isOsuResponseError } from '../helpers/osuApi';
import { UserGroup } from '../interfaces/user';
import { webhookPost, webhookColors } from '../helpers/discordApi';

const indexRouter = express.Router();

/* GET landing page. */
indexRouter.get('/', async (req, res, next) => {
    if (req.session?.osuId) {
        const u = await UserService.queryById(req.session.mongoId);

        if (u && !UserService.isError(u)) {
            return next();
        }
    }

    res.render('index', { title: `Mappers' Guild`, isIndex: true });
}, isLoggedIn, (req, res) => {
    res.render('index', {
        title: `Mappers' Guild`,
        isIndex: true,
        loggedInAs: req.session?.osuId,
        isNotSpectator: res.locals.userRequest.group != UserGroup.Spectator,
        userMongoId: req.session?.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});

/* GET user's code to login */
indexRouter.get('/login', canFail(async (req, res, next) => {
    if (req.session?.osuId && req.session?.username) {
        const u = await UserService.queryOne({ query: { osuId: req.session.osuId } });

        if (!u || UserService.isError(u)) {
            const newUser = await UserService.create(req.session.osuId, req.session.username, req.session.group);

            if (newUser && !UserService.isError(newUser)) {
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
                    LogService.create(req.session.mongoId, `joined the Mappers' Guild`, LogCategory.User);
                } else {
                    LogService.create(req.session.mongoId, `verified their account for the first time`, LogCategory.User);
                }

                return next();
            } else {
                return res.status(500).render('error', { message: 'Something went wrong!' });
            }
        } else {
            if (u.username != req.session.username) {
                u.username = req.session.username;
                await UserService.saveOrFail(u);
            }

            if (u.group != req.session.group && u.group != 'admin') {
                u.group = req.session.group;
                await UserService.saveOrFail(u);

                if (req.session.group == 'user') {
                    webhookPost([{
                        author: {
                            name: u.username,
                            icon_url: `https://a.ppy.sh/${u.osuId}`,
                            url: `https://osu.ppy.sh/u/${u.osuId}`,
                        },
                        color: webhookColors.lightRed,
                        description: `Joined the Mappers' Guild!`,
                    }]);
                    LogService.create(u._id, `joined the Mappers' Guild`, LogCategory.User);
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
}), isLoggedIn, (req, res) => {
    if (req?.session?.lastPage) {
        res.redirect(req.session.lastPage);
    } else if (res.locals.userRequest.group == 'admin') {
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
    if (!req.query.code || req.query.error) {
        return res.redirect('/');
    }

    const decodedState = Buffer.from(req.query.state, 'base64').toString('ascii');

    if (decodedState !== req.cookies._state) {
        res.clearCookie('_state');

        return res.status(403).render('error', { message: 'unauthorized' });
    }

    let response = await getToken(req.query.code);

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

/* GET redirect to bnsite */
indexRouter.get('/bnsite', (req, res) => {
    return res.redirect('https://bn.mappersguild.com');
});

export default indexRouter;
