import express from 'express';
import config from '../../config.json';
import { UserModel } from '../models/user';

const router = express.Router();

/* AUTHENTICATION */
router.use((req, res, next) => {
    const secret = req.header('secret');
    const username = req.header('username');
    console.log('ee');

    if (!secret || !username || config.interOpAccess[username].secret !== secret) {
        return res.status(401).send('Invalid key');
    }

    return next();
});

/* GET users */
router.get('/users', async (_, res) => {
    console.log('here');
    res.json(await UserModel.find({ group: 'admin' }));
});

module.exports = router;
