import express from 'express';
import config from '../../config.json';
import { UserModel } from '../models/user';
import { UserGroup } from '../../interfaces/user';

const interOpRouter = express.Router();

/* AUTHENTICATION */
interOpRouter.use((req, res, next) => {
    const secret = req.header('secret');
    const username = req.header('username');

    if (!secret || !username) {
        return res.status(401).json({ error: 'Missing secret or username headers' });
    }

    const userConfig = config.interOpAccess[username];
    if (!userConfig || userConfig.secret !== secret) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    return next();
});

/* GET users */
interOpRouter.get('/users', async (_, res) => {
    res.json(await UserModel.find({ group: UserGroup.Admin }));
});

/* GET user by osuId */
interOpRouter.get('/user/:id', async (req, res) => {
    const osuId = parseInt(req.params.id, 10);

    if (isNaN(osuId)) {
        return res.status(400).json({ error: 'Invalid osuId provided' });
    }

    try {
        const user = await UserModel.findOne({ osuId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default interOpRouter;
