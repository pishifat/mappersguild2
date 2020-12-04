import 'express-session';

declare module 'express-session' {
    interface SessionData {
        accessToken?: string;
        refreshToken?: string;
        expireDate?: Date;
        osuId?: number;
        mongoId?: any;
        lastPage?: string;
    }
}
