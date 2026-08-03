import { Document } from 'mongoose';
import { User } from './user';
import { MentorshipRecord } from './mentorshipRecord';

export interface MentorshipCycle extends Document {
    _id: any;
    id: string;
    number: number;
    name: string;
    startDate: Date;
    endDate: Date;
    url: string;
    isPublic: boolean;

    /** virtual field to populate */
    records: MentorshipRecord[];
    /** virtual field computed from "records" */
    participants: (Pick<User, '_id' | 'id' | 'username' | 'osuId'> & { mentorships: MentorshipRecord[] })[];
}