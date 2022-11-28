import { User } from './user';

export interface MentorshipCycle extends Document {
    _id: any;
    id: string;
    number: number;
    name: string;
    startDate: Date;
    endDate: Date;
    url: string;

    /** virtual field to populate */
    osuMentors: User[];
    taikoMentors: User[];
    catchMentors: User[];
    maniaMentors: User[];
    osuMentees: User[];
    taikoMentees: User[];
    catchMentees: User[];
    maniaMentees: User[];
    test: User[];
}