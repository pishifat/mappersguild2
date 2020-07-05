/* eslint-disable @typescript-eslint/no-use-before-define */
import mongoose, { Schema, Model } from 'mongoose';
import { SpentPoints, SpentPointsCategory } from '../interfaces/spentPoints';

interface SpentPointsStatics extends Model<SpentPoints> {
    generate: (
        category: SpentPointsCategory,
        userId: any,
        questId: any
    ) => Promise<SpentPoints>;
}

const spentPointsSchema = new Schema({
    category: { type: String, enum: ['extendDeadline', 'acceptQuest', 'createQuest', 'reopenQuest'], required: true },
    user: { type: 'ObjectId', ref: 'User', required: true },
    quest: { type: 'ObjectId', ref: 'Quest', required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

class SpentPointsService
{
    static generate (
        category: SpentPointsCategory,
        userId: any,
        questId: any
    ): Promise<SpentPoints> {
        const spentPoints = new SpentPointsModel();
        spentPoints.category = category,
        spentPoints.user = userId;
        spentPoints.quest = questId;

        return spentPoints.save();
    }
}

spentPointsSchema.loadClass(SpentPointsService);
const SpentPointsModel = mongoose.model<SpentPoints, SpentPointsStatics>('SpentPoints', spentPointsSchema);

export { SpentPointsModel };
