"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const log_1 = require("../models/log");
const log_2 = require("../../interfaces/log");
const logsRouter = express_1.default.Router();
logsRouter.use(middlewares_1.isLoggedIn);
/* GET logs */
logsRouter.get('/query', async (req, res) => {
    const query = log_1.LogModel
        .find({ category: { $ne: log_2.LogCategory.Error } })
        .sort('-createdAt');
    const skip = req.query.skip?.toString();
    if (skip)
        query.skip(parseInt(skip, 10));
    const logs = await query
        .limit(100)
        .populate({ path: 'user', select: 'username' });
    res.json({
        logs,
    });
});
exports.default = logsRouter;
