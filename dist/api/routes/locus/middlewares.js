"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUser = void 0;
const locusInfo_1 = require("../../models/locusInfo");
const user_1 = require("../../../interfaces/user");
async function isValidUser(req, res, next) {
    const id = req.params.id;
    const locusInfo = await locusInfo_1.LocusInfoModel
        .findById(id)
        .populate({ path: 'user', select: 'username osuId' })
        .orFail();
    const isLocusAdmin = res.locals.userRequest.group == user_1.UserGroup.Locus || res.locals.userRequest.group == user_1.UserGroup.Admin;
    if (req.session.mongoId !== locusInfo.user.id && !isLocusAdmin) {
        return res.json({ error: 'Invalid user' });
    }
    res.locals.locusInfo = locusInfo;
    next();
}
exports.isValidUser = isValidUser;
