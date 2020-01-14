import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { LogService, LogCategory } from '../models-ts/log';
import { UserGroup } from '../models-ts/user';

const logsRouter = express.Router();

logsRouter.use(isLoggedIn);

/* GET logs */
logsRouter.get('/', async (req, res) => {
    res.render('logs', {
        title: 'Logs',
        script: '../js/logs.js',
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
        skip: parseInt(req.params.skip),
    }));
});

/* POST creates a test log */
logsRouter.post('/create', async (req, res) => {
    const log = await LogService.create(
        req.session?.mongoId,
        req.body.action,
        req.body.modified,
        req.body.category
    );

    res.json(log);
});

export default logsRouter;
