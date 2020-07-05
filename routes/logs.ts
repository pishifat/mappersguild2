import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { LogModel } from '../models/log';
import { LogCategory } from '../interfaces/log';
import { UserGroup } from '../interfaces/user';

const logsRouter = express.Router();

logsRouter.use(isLoggedIn);

/* GET logs */
logsRouter.get('/', async (req, res) => {
    res.render('logs', {
        title: 'Logs',
        script: 'logs.js',
        isLogs: true,
        loggedInAs: req.session?.osuId,
        isNotSpectator: res.locals.userRequest.group != UserGroup.Spectator,
        userMongoId: req.session?.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
        logs: await LogModel
            .find({ category: { $ne: LogCategory.Error } })
            .sort('-createdAt')
            .populate({ path: 'user', select: 'username' })
            .limit(100),
    });
});

logsRouter.get('/more/:skip', async (req, res) => {
    res.json(
        await LogModel
            .find({ category: { $ne: LogCategory.Error } })
            .sort('-createdAt')
            .populate({ path: 'user', select: 'username' })
            .limit(100)
            .skip(parseInt(req.params.skip, 10))
    );
});

export default logsRouter;
