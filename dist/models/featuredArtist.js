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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const baseService_1 = __importDefault(require("./baseService"));
const featuredArtistSchema = new mongoose_1.Schema({
    label: { type: String, required: true },
    osuId: { type: Number },
    songs: [{ type: 'ObjectId', ref: 'FeaturedSong' }],
    isContacted: { type: Boolean },
    isResponded: { type: Boolean },
    tracksSelected: { type: Boolean },
    contractSent: { type: Boolean },
    contractSigned: { type: Boolean },
    contractPaid: { type: Boolean },
    songsTimed: { type: Boolean },
    songsReceived: { type: Boolean },
    assetsReceived: { type: Boolean },
    bioWritten: { type: Boolean },
    isInvited: { type: Boolean },
    isUpToDate: { type: Boolean },
    isStalled: { type: Boolean },
    isRejected: { type: Boolean },
    isDenied: { type: Boolean },
    isPriority: { type: Boolean },
    lastContacted: { type: Date },
    projectedRelease: { type: Date },
    notes: { type: String },
    assignedUser: { type: 'ObjectId', ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const FeaturedArtistModel = mongoose_1.default.model('FeaturedArtist', featuredArtistSchema);
class FeaturedArtistService extends baseService_1.default {
    constructor() {
        super(FeaturedArtistModel, { title: -1 }, [
            { path: 'songs', select: 'artist title' },
        ]);
    }
    create(label, osuId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (osuId) {
                    return yield FeaturedArtistModel.create({
                        label,
                        osuId,
                    });
                }
                else {
                    return yield FeaturedArtistModel.create({
                        label,
                    });
                }
            }
            catch (error) {
                return { error: error._message };
            }
        });
    }
}
const service = new FeaturedArtistService();
exports.FeaturedArtistService = service;
