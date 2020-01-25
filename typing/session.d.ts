declare namespace Express {
    interface Session {
        accessToken?: string;
        refreshToken: string;
        expireDate: Date;
        osuId: number;
        mongoId: any;
    }
}
