import express from 'express';
import { BeatmapModel } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../../interfaces/beatmap/beatmap';

export async function isValidBeatmap(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response | void> {
    const id = req.params.id || req.params.mapId;

    let beatmap;

    if (req.session?.osuId == 3178418) {    // pishifat can edit ranked maps
        beatmap = await BeatmapModel
            .findById(id)
            .defaultPopulate()
            .orFail();
    } else {                                // normal user can only edit unranked maps
        beatmap = await BeatmapModel
            .findById(id)
            .where('status')
            .ne(BeatmapStatus.Ranked)
            .defaultPopulate()
            .orFail();
    }

    res.locals.beatmap = beatmap;
    next();
}

export function isBeatmapHost(req: express.Request, res: express.Response, next: express.NextFunction): express.Response | void {
    if (req.session?.mongoId != res.locals.beatmap.host.id && res.locals.userRequest.osuId !== 3178418) {
        return res.json({ error: 'You are not mapset host!' });
    }

    next();
}