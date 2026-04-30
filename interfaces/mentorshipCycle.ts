import { User } from './user';

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
    participants: User[];
}