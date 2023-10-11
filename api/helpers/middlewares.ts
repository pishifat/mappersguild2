import { UserModel } from '../models/user';
import { UserGroup } from '../../interfaces/user';
import { refreshToken, isOsuResponseError, getUserInfo } from './osuApi';
import { FeaturedArtistModel } from '../models/featuredArtist';

export function unauthorize(req, res) {
    if (req.accepts(['html', 'json']) === 'json') {
        res.json({ error: 'Unauthorized - May need to login first' });
    } else {
        res.redirect('/');
    }
}

export async function isLoggedIn(req, res, next): Promise<void> {
    if (!req.session.mongoId) {
        if (req.accepts(['html', 'json']) !== 'json') {
            req.session.lastPage = req.originalUrl;
        }

        return unauthorize(req, res);
    }

    const u = await UserModel.findById(req.session.mongoId);

    if (!u) return unauthorize(req, res);

    // Refresh if less than 10 hours left
    if (new Date() > new Date(req.session.expireDate - (10 * 3600 * 1000))) {
        const response = await refreshToken(req.session.refreshToken);

        if (!response || isOsuResponseError(response)) {
            req.session.destroy();

            return res.redirect('/');
        }

        // *1000 because maxAge is miliseconds, oauth is seconds
        req.session.cookie.maxAge = response.expires_in * 2 * 1000;
        req.session.expireDate = Date.now() + (response.expires_in * 1000);
        req.session.accessToken = response.access_token;
        req.session.refreshToken = response.refresh_token;
    }

    res.locals.userRequest = u;
    next();
}

export async function isValidUser(req, res, next): Promise<void> {
    if (!req.body.user) {
        next();
    } else {
        const u = await UserModel
            .findOne()
            .byUsernameOrOsuId(req.body.user);

        if (!u) {
            return res.json({ error: 'Cannot find user!' });
        }

        res.locals.user = u;
        next();
    }
}

export function isAdmin(req, res, next): void {
    if (res.locals.userRequest.group == UserGroup.Admin) {
        next();
    } else {
        unauthorize(req, res);
    }
}

export function isMentorshipAdmin(req, res, next): void {
    if (res.locals.userRequest.isMentorshipAdmin || res.locals.userRequest.group == UserGroup.Admin) {
        next();
    } else {
        unauthorize(req, res);
    }
}

export function isLocusAdmin(req, res, next): void {
    const osuIds = [1893718, 18983, 7671790, 5052899]; // mangomizer, Doomsday, Komm, Matrix

    if (osuIds.includes(res.locals.userRequest.osuId) || res.locals.userRequest.group == UserGroup.Admin) {
        next();
    } else {
        unauthorize(req, res);
    }
}

export function hasMerchAccess(req, res, next): void {
    const osuIds = [3178418];

    if (osuIds.includes(res.locals.userRequest.osuId)) {
        next();
    } else {
        unauthorize(req, res);
    }
}

export function isSuperAdmin(req, res, next): void {
    if (res.locals.userRequest.osuId == 3178418 || res.locals.userRequest.osuId == 1052994) {
        next();
    } else {
        unauthorize(req, res);
    }
}

export async function isBn(accessToken): Promise<boolean> {
    if (accessToken) {
        const res = await getUserInfo(accessToken);

        if (!isOsuResponseError(res) && (res.groups.some(g => g.id == 7 || g.id == 28 || g.id == 32))) {
            return true;
        }
    }

    return false;
}

export async function canEditArtist(req, res, next): Promise<void> {
    if (res.locals.userRequest.group == UserGroup.Admin || res.locals.userRequest.group == UserGroup.Secret) {
        return next();
    }

    const id = req.params.id || req.params.artistId;

    const artist = await FeaturedArtistModel
        .findById(id)
        .defaultPopulateWithSongs()
        .orFail();

    const offeredUsersIds = artist.offeredUsers.map(u => u.id);
    const showcaseMapperIds = artist.showcaseMappers.map(u => u.id);

    if (offeredUsersIds.includes(res.locals.userRequest.id) || showcaseMapperIds.includes(res.locals.userRequest.id)) {
        next();
    } else {
        unauthorize(req, res);
    }
}

export function isValidUrl(req, res, next): void {
    if (!req.body.url?.length) {
        req.body.url = null;
    }

    const regexp = /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;

    if (!regexp.test(req.body.url) && req.body.url) {
        return res.json({ error: 'Not a valid URL' });
    }

    next();
}