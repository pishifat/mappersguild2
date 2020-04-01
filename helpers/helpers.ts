import { Points } from '../interfaces/extras';
import { Quest, QuestStatus } from '../interfaces/quest';
import { Beatmap } from '../interfaces/beatmap/beatmap';
import { Task } from '../interfaces/beatmap/task';

export function canFail(fn: Function) {
    return function(req, res, next): void {
        fn(req, res, next).catch((error: Error) => {
            console.log(error.message);

            return next(error);
        });
    };
}

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

export function findLengthNerf(length: number): number {
    const lengthNerf = 125;
    let newLength;

    if (length <= 90) {
        newLength = length;
    } else if (length <= 150) {
        newLength = ((length - 90) / 2) + 90;
    } else if (length <= 210) {
        newLength = ((length - 150) / 3) + 120;
    } else if (length <= 270) {
        newLength = ((length - 210) / 4) + 140;
    } else {
        newLength = ((length - 270) / 5) + 155;
    }

    return newLength/lengthNerf;
}

export function findDifficultyPoints(taskName: string, totalMappers: number): number {
    const difficultyPointsObject: Partial<Points> = {
        Easy: 5,
        Normal: 6,
        Hard: 7,
        Insane: 8,
        Expert: 8,
    };

    return difficultyPointsObject[taskName] / totalMappers;
}

export function findQuestPoints(deadline: Quest['deadline'], questCompletedDate: Quest['completed'], rankedDate: Beatmap['rankedDate']): number {
    const lateness = +deadline - +questCompletedDate;

    if (lateness > 0 && +rankedDate > +new Date('2019-03-01')) { //2019-03-01 is when mappers' guild website launched
        return 7;
    } else {
        return 0;
    }
}

export function findQuestBonus(status: Quest['status'], deadline: Quest['deadline'], rankedDate: Beatmap['rankedDate'], totalMappers: number): number {
    let questBonus = 0;

    if (status == QuestStatus.Done) {
        const lateness = (+deadline - +rankedDate) / (24*3600*1000);

        if (lateness > 0) {
            questBonus = 2;
        } else if (lateness > -20) {
            questBonus = 1.5;
        } else if (lateness > -40) {
            questBonus = 1;
        } else {
            questBonus = 0.5;
        }
    }

    return questBonus/totalMappers;
}

export function findStoryboardPoints(storyboardQuality: Task['sbQuality']): number {
    if (!storyboardQuality) {
        return 0;
    } else if (storyboardQuality == 2) {
        return 7.5;
    } else {
        return (storyboardQuality * storyboardQuality + 1); //sb worth 2 or 10
    }
}

export const defaultErrorMessage = { error: 'Something went wrong!' };

export interface BasicResponse {
    error?: string;
    success?: string;
}

export interface BasicError {
    error: string;
}
