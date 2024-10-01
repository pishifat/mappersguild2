import express from 'express';
import config from '../../config.json';
import { UserModel } from '../models/user';
import { UserGroup } from '../../interfaces/user';

const interOpRouter = express.Router();

/* AUTHENTICATION */
interOpRouter.use((req, res, next) => {
    const secret = req.header('secret');
    const username = req.header('username');

    if (!secret || !username || config.interOpAccess[username].secret !== secret) {
        return res.status(401).send('Invalid key');
    }

    return next();
});

/* GET users */
interOpRouter.get('/users', async (_, res) => {
    res.json(await UserModel.find({ group: UserGroup.Admin }));
});

export default interOpRouter;
