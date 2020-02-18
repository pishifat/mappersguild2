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
const user_1 = require("../models/user");
const faqRouter = express_1.default.Router();
faqRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let response = {
        title: 'Frequently Asked Questions',
        isFaq: true,
    };
    const u = yield user_1.UserService.queryById((_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId);
    if (u && !user_1.UserService.isError(u)) {
        response = Object.assign(Object.assign({}, response), { loggedInAs: u.osuId, isNotSpectator: u.group != 'spectator', userTotalPoints: u.totalPoints });
    }
    res.render('faq', response);
}));
exports.default = faqRouter;
