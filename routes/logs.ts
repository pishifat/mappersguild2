import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { LogService } from '../models/log';
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
        logs: await LogService.queryAll({
            query: { category: { $ne: LogCategory.Error } },
            useDefaults: true,
            limit: 100,
        }),
        loggedInAs: req.session?.osuId,
        isNotSpectator: res.locals.userRequest.group != UserGroup.Spectator,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

logsRouter.get('/more/:skip', async (req, res) => {
    res.json(await LogService.queryAll({
        query: {
            category: {
                $ne: LogCategory.Error,
            },
        },
        useDefaults: true,
        limit: 100,
        skip: parseInt(req.params.skip, 10),
    }));
});

export default logsRouter;
