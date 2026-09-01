import { User } from './user';

export interface Background {
    _id: any;
    id: string;
    name: string;
    link: string;
    user: User;
    approved: boolean;
    hidden: boolean;
    denied: boolean;
    deniedReason?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
