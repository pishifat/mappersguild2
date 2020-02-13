import express from 'express';
import { isAdmin, isLoggedIn } from '../helpers/middlewares';
import { UserService } from '../models/user';
import { ContestService } from '../models/contest/contest';
import { EntryService } from '../models/contest/entry';
import { JudgingService } from '../models/contest/judging';

const judgingRouter = express.Router();

judgingRouter.use(isLoggedIn);
judgingRouter.use(isAdmin);

/* GET parties page. */
judgingRouter.get('/', (req, res) => {
    res.render('judging', {
        title: 'Judging',
        script: '../javascripts/judging.js',
        loggedInAs: req.session?.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

judgingRouter.get('/relevantInfo', async (req, res) => {
    //if population doesn't work here, there's a problem
    const c = await ContestService.queryOneOrFail({
        query: {
            isActive: true,
        },
        defaultPopulate: true,
    });

    console.log(c);

    res.json({ contest: c, userId: req.session?.mongoId, isAdmin: res.locals.userRequest.osuId == 3178418 });
});

export default judgingRouter;
