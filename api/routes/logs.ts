import express from 'express';
import { LogModel } from '../models/log';
import { LogCategory } from '../../interfaces/log';

const logsRouter = express.Router();

/* GET logs */
logsRouter.get('/query', async (req, res) => {
    const query = LogModel
        .find({ category: { $ne: LogCategory.Error } })
        .sort('-createdAt');

    const skip = req.query.skip?.toString();

    if (skip) query.skip(parseInt(skip, 10));

    const logs = await query
        .limit(100)
        .populate({ path: 'user', select: 'username osuId' });

    res.json({
        logs,
    });
});

export default logsRouter;
