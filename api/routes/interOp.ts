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

/* GET user mentorships by osuId or username */
interOpRouter.get('/userMentorships/:id', async (req, res) => {
    const identifier = req.params.id;
    const osuId = parseInt(identifier, 10);

    try {
        let user;
        
        if (isNaN(osuId)) {
            // Search by username
            user = await UserModel.findOne()
                .byUsername(identifier)
                .select('osuId username mentorships')
                .populate('mentorships.cycle', 'name');
        } else {
            // Search by osuId
            user = await UserModel.findOne({ osuId })
                .select('osuId username mentorships')
                .populate('mentorships.cycle', 'name');
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default interOpRouter;
