import express from 'express';
import { isLoggedIn, isAdmin } from '../../helpers/middlewares';
import { canFail, defaultErrorMessage } from '../../helpers/helpers';
import { ContestService } from '../../models/contest/contest';

const adminContestsRouter = express.Router();

adminContestsRouter.use(isLoggedIn);
adminContestsRouter.use(isAdmin);

/* GET admin page */
adminContestsRouter.get('/', (req, res) => {
    res.render('admin/contests', {
        title: 'Contests Admin',
        script: '../javascripts/adminContests.js',
        loggedInAs: req.session?.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

adminContestsRouter.get('/relevantInfo', async (req, res) => {
    const contests = await ContestService.queryAll({
        defaultPopulate: true,
    });

    res.json({
        contests,
    });
});

adminContestsRouter.get('/create', async (req, res) => {
});

adminContestsRouter.get('/:id/addJudge', async (req, res) => {
});

adminContestsRouter.get('/:id/removeJudge', async (req, res) => {
});

adminContestsRouter.get('/:id/addVoters', async (req, res) => {
});

export default adminContestsRouter;
