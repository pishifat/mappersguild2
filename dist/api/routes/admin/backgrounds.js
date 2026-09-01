"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const background_1 = require("../../models/background");
const user_1 = require("../../models/user");
const adminBackgroundsRouter = express_1.default.Router();
adminBackgroundsRouter.use(middlewares_1.isLoggedIn);
adminBackgroundsRouter.use(middlewares_1.isAdmin);
/* GET bgs (all) */
adminBackgroundsRouter.get('/loadAll', async (req, res) => {
    const backgrounds = await background_1.BackgroundModel
        .find({})
        .defaultPopulate()
        .sort({ createdAt: -1 });
    res.json(backgrounds);
});
/* POST bg approve */
adminBackgroundsRouter.post('/:id/approve', async (req, res) => {
    const background = await background_1.BackgroundModel.findById(req.params.id).orFail();
    background.approved = true;
    await background.save();
    res.json(await background.populate({ path: 'user', select: 'username osuId' }));
});
/* POST toggle bg hidden */
adminBackgroundsRouter.post('/:id/toggleHidden', async (req, res) => {
    const background = await background_1.BackgroundModel.findById(req.params.id).orFail();
    background.hidden = !background.hidden;
    await background.save();
    res.json(await background.populate({ path: 'user', select: 'username osuId' }));
});
/* POST toggle bg denied */
adminBackgroundsRouter.post('/:id/toggleDenied', async (req, res) => {
    const background = await background_1.BackgroundModel.findById(req.params.id).orFail();
    background.denied = !background.denied;
    background.deniedReason = background.denied ? (req.body.reason || '').trim() : '';
    await background.save();
    res.json(await background.populate({ path: 'user', select: 'username osuId' }));
});
/* POST update bg user */
adminBackgroundsRouter.post('/:id/updateUser', async (req, res) => {
    const user = await user_1.UserModel.findOne().byUsernameOrOsuId(req.body.user);
    if (!user) {
        return res.json({ error: `Cannot find ${req.body.user}!` });
    }
    const background = await background_1.BackgroundModel.findById(req.params.id).orFail();
    background.user = user._id;
    await background.save();
    res.json(await background.populate({ path: 'user', select: 'username osuId' }));
});
/* POST update bg tags */
adminBackgroundsRouter.post('/:id/updateTags', async (req, res) => {
    const tags = (req.body.tags || '')
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter((t, i, arr) => t.length && arr.indexOf(t) === i);
    const background = await background_1.BackgroundModel.findById(req.params.id).orFail();
    background.tags = tags;
    await background.save();
    res.json(await background.populate({ path: 'user', select: 'username osuId' }));
});
/* POST bg delete */
adminBackgroundsRouter.post('/:id/delete', async (req, res) => {
    await background_1.BackgroundModel.findByIdAndDelete(req.params.id).orFail();
    res.json({ success: 'ok' });
});
exports.default = adminBackgroundsRouter;
