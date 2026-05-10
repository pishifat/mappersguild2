import { User } from './user';

export interface TeamInfo extends Document {
    _id: any;
    id: string;
    user: User;
    timezone: string,
    availability: string,
    languages: string[],
    discord: string,
    email: string,
    about: string,
    isPublic: boolean,
    isOnTeam: boolean,
    isHiddenByAdmin: boolean,
    contest: string,
}
