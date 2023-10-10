import express from 'express';
import { LocusInfoModel } from '../../models/locusInfo';

export async function isValidUser(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response | void> {
    const id = req.params.id;
    const locusInfo = await LocusInfoModel
        .findById(id)
        .defaultPopulate()
        .orFail();

    if (req.session.mongoId !== locusInfo.user.id) {
        return res.json({ error: 'Invalid user' });
    }

    res.locals.locusInfo = locusInfo;

    next();
}