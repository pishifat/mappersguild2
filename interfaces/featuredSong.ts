import { User } from './user';

export interface FeaturedSong {
    _id: any;
    id: string;
    artist: string;
    title: string;
    songShowcaseMappers: User[];
    oszUrl: string;
}