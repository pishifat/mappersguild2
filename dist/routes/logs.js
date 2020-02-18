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
const user_1 = require("../interfaces/user");
const logsRouter = express_1.default.Router();
logsRouter.use(middlewares_1.isLoggedIn);
logsRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    res.render('logs', {
        title: 'Logs',
        script: 'logs.js',
        isLogs: true,
        logs: yield log_1.LogService.queryAll({
            query: { category: { $ne: log_2.LogCategory.Error } },
            useDefaults: true,
            limit: 100,
        }),
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        isNotSpectator: res.locals.userRequest.group != user_1.UserGroup.Spectator,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
}));
logsRouter.get('/more/:skip', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield log_1.LogService.queryAll({
        query: {
            category: {
                $ne: log_2.LogCategory.Error,
            },
        },
        useDefaults: true,
        limit: 100,
        skip: parseInt(req.params.skip, 10),
    }));
}));
exports.default = logsRouter;
