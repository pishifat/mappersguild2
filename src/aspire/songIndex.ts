import Fuse from 'fuse.js';

export type AspireSearchStatus =
    | { kind: 'idle' }
    | { kind: 'match', line: string }
    | { kind: 'empty', query: string };

// https://gist.github.com/Walavouchey/d9e4259223699a5d74fe770b49e2fdcf
export const ASPIRE_SONG_LIST_URL = '/aspire/featured-artists-2026-06-14.txt';

const MIN_QUERY_LENGTH = 2;
const RESULT_LIMIT = 15;

interface SongEntry {
    line: string;
    searchKey: string;
}

function normalize (value: string): string {
    return value
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

let indexPromise: Promise<Fuse<SongEntry>> | null = null;

export function loadAspireSongIndex (): Promise<Fuse<SongEntry>> {
    if (!indexPromise) {
        indexPromise = fetch(ASPIRE_SONG_LIST_URL).then(async res => {
            if (!res.ok) {
                throw new Error('Failed to load song list');
            }

            const text = await res.text();
            const entries = text
                .split('\n')
                .map(line => line.trim())
                .filter(Boolean)
                .map(line => ({ line, searchKey: normalize(line) }));

            return new Fuse(entries, {
                keys: ['searchKey'],
                threshold: 0.35,
                ignoreLocation: true,
                minMatchCharLength: MIN_QUERY_LENGTH,
            });
        });
    }

    return indexPromise;
}

export function normalizeAspireQuery (query: string): string {
    return normalize(query);
}

export function searchAspireSongs (
    fuse: Fuse<SongEntry>,
    query: string,
): { lines: string[], status: AspireSearchStatus } {
    const normalized = normalize(query);

    if (normalized.length < MIN_QUERY_LENGTH) {
        return { lines: [], status: { kind: 'idle' } };
    }

    const results = fuse.search(normalized, { limit: RESULT_LIMIT });
    const lines = results.map(result => result.item.line);

    if (lines.length === 0) {
        return { lines: [], status: { kind: 'empty', query: query.trim() } };
    }

    return { lines, status: { kind: 'idle' } };
}
