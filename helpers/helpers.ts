export function findBeatmapsetId(url: string): number {
    const indexStart = url.indexOf('beatmapsets/') + 'beatmapsets/'.length;
    const indexEnd = url.indexOf('#');
    let bmId = '';

    if (indexEnd !== -1) {
        bmId = url.slice(indexStart, indexEnd);
    } else {
        bmId = url.slice(indexStart);
    }

    return parseInt(bmId, 10);
}

export function sleep(ms): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const defaultErrorMessage = { error: 'Something went wrong!' };

export interface BasicResponse {
    error?: string;
    success?: string;
}

export interface BasicError {
    error: string;
}
