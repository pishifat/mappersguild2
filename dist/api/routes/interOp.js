"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_json_1 = __importDefault(require("../../config.json"));
const user_1 = require("../models/user");
const user_2 = require("../../interfaces/user");
const interOpRouter = express_1.default.Router();
/* AUTHENTICATION */
interOpRouter.use((req, res, next) => {
    const secret = req.header('secret');
    const username = req.header('username');
    if (!secret || !username) {
        return res.status(401).json({ error: 'Missing secret or username headers' });
    }
    const userConfig = config_json_1.default.interOpAccess[username];
    if (!userConfig || userConfig.secret !== secret) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    return next();
});
/* GET users */
interOpRouter.get('/users', async (_, res) => {
    res.json(await user_1.UserModel.find({ group: user_2.UserGroup.Admin }));
});
/* GET user by osuId */
interOpRouter.get('/user/:id', async (req, res) => {
    const osuId = parseInt(req.params.id, 10);
    if (isNaN(osuId)) {
        return res.status(400).json({ error: 'Invalid osuId provided' });
    }
    try {
        const user = await user_1.UserModel.findOne({ osuId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = interOpRouter;
