import express from 'express';
import { BeatmapModel } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { defaultErrorMessage } from '../../helpers/helpers';
import { UserModel } from '../../models/user';

const inviteError = 'Invite not sent: ';

export async function isValidBeatmap(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response | void> {
    const id = req.params.id || req.params.mapId;
    const b = await BeatmapModel.findById(id).defaultPopulate();

    if (!b) {
        return res.json(defaultErrorMessage);
    }

    if (b.status == BeatmapStatus.Ranked) {
        //should check in query ^
        return res.json({ error: 'Mapset ranked' });
    }

    res.locals.beatmap = b;
    next();
}

export function isBeatmapHost(req: express.Request, res: express.Response, next: express.NextFunction): express.Response | void {
    if (req.session?.mongoId != res.locals.beatmap.host.id) {
        return res.json({ error: 'You are not mapset host!' });
    }

    next();
}

export async function isValidUser(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response | void> {
    let rexExp;

    if (req.body.user.indexOf('[') >= 0 || req.body.user.indexOf(']') >= 0) {
        rexExp = new RegExp('^\\' + req.body.user + '$', 'i');
    } else {
        rexExp = new RegExp('^' + req.body.user + '$', 'i');
    }

    const u = await UserModel.findOne({ username: rexExp });

    if (!u) {
        return res.json({ error: inviteError + 'Cannot find user!' });
    }

    // pishi's so pro that can choose himself
    if (u.osuId == req.session?.osuId && req.session?.osuId != 3178418) {
        return res.json({ error: inviteError + 'Choose someone other than yourself!' });
    }

    res.locals.user = u;
    next();
}
