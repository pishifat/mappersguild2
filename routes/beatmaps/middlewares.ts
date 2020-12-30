import express from 'express';
import { BeatmapModel } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { UserModel } from '../../models/user';

const inviteError = 'Invite not sent: ';

export async function isValidBeatmap(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response | void> {
    const id = req.params.id || req.params.mapId;
    const beatmap = await BeatmapModel
        .findById(id)
        .where('status')
        .ne(BeatmapStatus.Ranked)
        .defaultPopulate()
        .orFail();

    res.locals.beatmap = beatmap;
    next();
}

export function isBeatmapHost(req: express.Request, res: express.Response, next: express.NextFunction): express.Response | void {
    if (req.session?.mongoId != res.locals.beatmap.host.id) {
        return res.json({ error: 'You are not mapset host!' });
    }

    next();
}

export async function isValidUser(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response | void> {
    const u = await UserModel
        .findOne()
        .byUsernameOrOsuId(req.body.user);

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
