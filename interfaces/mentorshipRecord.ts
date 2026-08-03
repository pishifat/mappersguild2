import { Document } from 'mongoose';
import { User } from './user';
import { MentorshipCycle } from './mentorshipCycle';

export type MentorshipMode =
    'osu' | 'taiko' | 'catch' | 'mania' |
    'osuModding' | 'taikoModding' | 'catchModding' | 'maniaModding' |
    'osuGraduation' | 'taikoGraduation' | 'catchGraduation' | 'maniaGraduation' |
    'storyboard';

export type MentorshipGroup = 'mentor' | 'mentee' | 'extraMentor';

export interface MentorshipRecord extends Document {
    _id: any;
    id: string;
    user: User;
    cycle: MentorshipCycle;
    mode: MentorshipMode;
    group: MentorshipGroup;
    mentor: User;
    phases: number[];
    createdAt: Date;
    updatedAt: Date;
}
