import express from 'express';
import { ContestModel } from '../../models/contest/contest';

export async function isContestCreator(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response | void> {
    const id = req.params.id;
    const contest = await ContestModel
        .findById(id)
        .orFail();

    if (!contest.creator) {
        return res.json({ error: 'Contest has no creator' });
    }

    if (req.session?.mongoId != contest.creator.toString()) {
        return res.json({ error: 'You are not the contest creator!' });
    }

    next();
}