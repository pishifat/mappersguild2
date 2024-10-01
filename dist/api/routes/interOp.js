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
    if (!secret || !username || config_json_1.default.interOpAccess[username].secret !== secret) {
        return res.status(401).send('Invalid key');
    }
    return next();
});
/* GET users */
interOpRouter.get('/users', async (_, res) => {
    res.json(await user_1.UserModel.find({ group: user_2.UserGroup.Admin }));
});
exports.default = interOpRouter;
