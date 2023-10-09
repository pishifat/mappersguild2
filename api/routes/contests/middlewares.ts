import express from 'express';
import { ContestStatus } from '../../../interfaces/contest/contest';
import { ContestModel } from '../../models/contest/contest';

export async function isContestCreator(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response | void> {
    const id = req.params.id;
    const contest = await ContestModel
        .findById(id)
        .orFail();

    if (!contest.creators || !contest.creators.length) {
        return res.json({ error: 'Contest has no creator' });
    }

    const creatorIds = contest.creators.map(c => c.toString());

    if (!creatorIds.includes(req.session?.mongoId) && req.session?.osuId !== 3178418) {
        return res.json({ error: 'You are not the contest creator!' });
    }

    next();
}

export async function isEditable(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response | void> {
    const id = req.params.id;
    const contest = await ContestModel
        .findById(id)
        .orFail();

    if (contest.status == ContestStatus.Complete && res.locals.userRequest.osuId !== 3178418) { // only pishifat can edit completed contests
        return res.json({ error: 'Cannot edit this section of completed contests' });
    }

    next();
}

export async function isComplete(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response | void> {
    const id = req.params.id;
    const contest = await ContestModel
        .findById(id)
        .orFail();

    if (contest.status !== ContestStatus.Complete) {
        return res.json({ error: 'Cannot load this on incomplete contests' });
    }

    next();
}