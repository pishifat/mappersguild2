"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const quest_1 = require("../interfaces/quest");
const beatmap_1 = require("./beatmap/beatmap");
const questSchema = new mongoose_1.Schema({
    creator: { type: 'ObjectId', ref: 'User' },
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    descriptionMain: { type: String, required: true },
    timeframe: { type: Number, required: true },
    requiredMapsets: { type: Number },
    minParty: { type: Number, required: true },
    maxParty: { type: Number, required: true },
    minRank: { type: Number, required: true },
    art: { type: Number },
    isMbc: { type: Boolean },
    status: { type: String, enum: ['open', 'wip', 'done', 'pending', 'rejected', 'hidden'], default: 'open' },
    modes: [{ type: String, default: ['osu', 'taiko', 'catch', 'mania'], required: true }],
    expiration: { type: Date },
    accepted: { type: Date },
    deadline: { type: Date },
    completed: { type: Date },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
questSchema.virtual('associatedMaps', {
    ref: 'Beatmap',
    localField: '_id',
    foreignField: 'quest',
});
questSchema.virtual('parties', {
    ref: 'Party',
    localField: '_id',
    foreignField: 'quest',
});
questSchema.virtual('currentParty').get(function () {
    var _a;
    if ((this.status === quest_1.QuestStatus.WIP || this.status === quest_1.QuestStatus.Done) && ((_a = this.parties) === null || _a === void 0 ? void 0 : _a.length))
        return this.parties[0];
    return undefined;
});
questSchema.virtual('isExpired').get(function () {
    return ((+new Date() > +this.expiration) && this.status == 'open');
});
questSchema.virtual('reopenPrice').get(function () {
    return this.price * 0.5 + 25;
});
questSchema.methods.dissociateBeatmaps = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.associatedMaps) {
            for (const beatmap of this.associatedMaps) {
                if (userId) {
                    for (const task of beatmap.tasks) {
                        if (task.mappers.some(m => m.id == userId)) {
                            yield beatmap_1.BeatmapModel.findByIdAndUpdate(beatmap._id, { quest: undefined });
                            break;
                        }
                    }
                }
                else {
                    yield beatmap_1.BeatmapModel.findByIdAndUpdate(beatmap._id, { quest: undefined });
                }
            }
        }
    });
};
questSchema.methods.removeParties = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.parties.length) {
            for (const party of this.parties) {
                yield party.remove();
            }
        }
    });
};
questSchema.methods.drop = function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.dissociateBeatmaps();
        yield this.removeParties();
        const openQuest = yield QuestModel.findOne({
            name: this.name,
            status: quest_1.QuestStatus.Open,
        });
        if (openQuest) {
            this.status = quest_1.QuestStatus.Hidden;
            openQuest.modes.push(...this.modes);
            yield openQuest.save();
        }
        else {
            this.status = quest_1.QuestStatus.Open;
        }
        yield this.save();
        return openQuest || this;
    });
};
const queryHelpers = {
    sortByLastest() {
        return this.sort({ createdAt: -1 });
    },
    defaultPopulate() {
        return this.populate([
            { path: 'parties', populate: { path: 'members leader' } },
            {
                path: 'associatedMaps',
                populate: {
                    path: 'song host tasks',
                    populate: {
                        path: 'mappers',
                    },
                },
            },
            { path: 'creator', select: 'username osuId' },
        ]);
    },
};
questSchema.query = queryHelpers;
questSchema.statics.findAll = function () {
    return QuestModel
        .find({})
        .defaultPopulate()
        .sortByLastest();
};
questSchema.statics.defaultFindByIdOrFail = function (id) {
    return QuestModel
        .findById(id)
        .defaultPopulate()
        .orFail();
};
const QuestModel = mongoose_1.default.model('Quest', questSchema);
exports.QuestModel = QuestModel;
