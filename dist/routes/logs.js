"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const log_1 = require("../models/log");
const log_2 = require("../interfaces/log");
const logsRouter = express_1.default.Router();
logsRouter.use(middlewares_1.isLoggedIn);
logsRouter.get('/query', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const query = log_1.LogModel
        .find({ category: { $ne: log_2.LogCategory.Error } })
        .sort('-createdAt');
    const skip = (_a = req.query.skip) === null || _a === void 0 ? void 0 : _a.toString();
    if (skip)
        query.skip(parseInt(skip, 10));
    const logs = yield query
        .limit(100)
        .populate({ path: 'user', select: 'username' });
    res.json({
        logs,
    });
}));
exports.default = logsRouter;
