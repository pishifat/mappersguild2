import { UserModel } from '../models/user';
import { UserGroup } from '../../interfaces/user';
import { refreshToken, isOsuResponseError, getUserInfo } from './osuApi';

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

export function isAdmin(req, res, next): void {
    if (res.locals.userRequest.group == UserGroup.Admin) {
        next();
    } else {
        unauthorize(req, res);
    }
}

export function isSecret(req, res, next): void {
    if (res.locals.userRequest.group == UserGroup.Secret || res.locals.userRequest.group == UserGroup.Admin) {
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

export function isNotSpectator(req, res, next): void {
    if (res.locals.userRequest.group != UserGroup.Spectator) {
        next();
    } else {
        return res.json({ error: 'You need 3+ ranked maps to do this! You can only join parties/beatmaps through invites.' });
    }
}

export async function isBn(accessToken): Promise<boolean> {
    if (accessToken) {
        const res = await getUserInfo(accessToken);

        if (!isOsuResponseError(res) && (res.is_nat || res.is_bng)) {
            return true;
        }
    }

    return false;
}
