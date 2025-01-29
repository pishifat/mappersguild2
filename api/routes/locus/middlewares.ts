import express from 'express';
import { LocusInfoModel } from '../../models/locusInfo';
import { UserGroup } from '../../../interfaces/user';

export async function isValidUser(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response | void> {
    const id = req.params.id;
    const locusInfo = await LocusInfoModel
        .findById(id)
        .populate({ path: 'user', select: 'username osuId' })
        .orFail();

    const isLocusAdmin = res.locals.userRequest.group == UserGroup.Locus || res.locals.userRequest.group == UserGroup.Admin;

    if (req.session.mongoId !== locusInfo.user.id && !isLocusAdmin) {
        return res.json({ error: 'Invalid user' });
    }

    res.locals.locusInfo = locusInfo;

    next();
}