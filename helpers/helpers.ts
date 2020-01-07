export function canFail(fn: Function) {
    return function(req, res, next): void {
        fn(req, res, next).catch((error: Error) => {
            console.log(error.message);

            return next(error);
        });
    };
}

export const defaultErrorMessage = { error: 'Something went wrong!' };

export interface BasicResponse {
    error?: string;
    success?: string;
}

export interface BasicError {
    error: string;
}
