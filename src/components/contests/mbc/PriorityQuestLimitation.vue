<template>
    <div>
        <h5>Priority Quest: Limitation</h5>
        <h6>Confirm that no more than 3 hit objects of the same type are used consecutively</h6>
        <div class="row">
            <mbc-drop-zone @drop="processFiles" />

            <div v-if="output?.length || error?.length || violations.length" class="col-sm-12 mt-2">
                <pre v-if="output?.length" class="text-success">{{ output }}</pre>
                <pre v-if="error?.length" class="text-danger">{{ error }}</pre>
                <div v-if="violations.length" class="text-danger">
                    <div v-for="v in violations" :key="v.timestamp + v.message">
                        <a :href="`osu://edit/${v.timestamp}`" class="text-danger">{{ v.timestamp }}</a> - {{ v.message }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MbcDropZone from '@components/contests/mbc/MbcDropZone.vue';

export default defineComponent({
    name: 'PriorityQuestLimitation',
    components: {
        MbcDropZone,
    },
    data() {
        return {
            error: '',
            output: '',
            violations: [] as any[],
        };
    },
    methods: {
        formatTimestamp (ms) {
            const minutes = Math.floor(ms / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            const millis = ms % 1000;

            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(millis).padStart(3, '0')}`;
        },
        parseBreaks (lines) {
            let inEvents = false;
            const breaks: any[] = [];

            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed === '[Events]') { inEvents = true; continue; }

                if (inEvents && /^\[.+\]$/.test(trimmed)) { inEvents = false; continue; }

                if (!inEvents || trimmed.length === 0) continue;

                const parts = trimmed.split(',');

                if (parts[0] === '2' && parts.length >= 3) {
                    breaks.push({ startTime: parseInt(parts[1], 10), endTime: parseInt(parts[2], 10) });
                }
            }

            return breaks;
        },
        parseMode (lines) {
            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed.startsWith('Mode:')) {
                    return parseInt(trimmed.split(':')[1].trim(), 10);
                }
            }

            return -1;
        },
        parseHitObjects (lines) {
            let inHitObjects = false;
            const hitObjects: any[] = [];

            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed === '[HitObjects]') {
                    inHitObjects = true;
                    continue;
                }

                if (inHitObjects && /^\[.+\]$/.test(trimmed)) {
                    inHitObjects = false;
                    continue;
                }

                if (!inHitObjects || trimmed.length === 0) continue;

                const parts = trimmed.split(',');

                if (parts.length < 5) continue;

                hitObjects.push({
                    x: parseInt(parts[0], 10),
                    time: parseInt(parts[2], 10),
                    typeField: parseInt(parts[3], 10),
                    hitsound: parseInt(parts[4], 10),
                    raw: parts,
                });
            }

            return hitObjects;
        },
        checkConsecutive (sequence, breaks, violations, ignoreTypes: any[] = []) {
            let i = 0;

            while (i < sequence.length) {
                let j = i + 1;

                while (
                    j < sequence.length &&
                    sequence[j].type === sequence[i].type &&
                    !breaks.some(b => b.startTime > sequence[j - 1].time && b.startTime < sequence[j].time)
                ) j++;

                const runLength = j - i;

                if (runLength > 3 && !ignoreTypes.includes(sequence[i].type)) {
                    violations.push({ timestamp: this.formatTimestamp(sequence[i].time), message: `${runLength} consecutive ${sequence[i].type}s` });
                }

                i = j;
            }
        },
        checkMania (hitObjects, breaks, violations) {
            const leniency = 2;

            const events: any[] = [];
            const holdNotes: any[] = [];

            for (const h of hitObjects) {
                if (h.typeField & 128) {
                    const endTime = parseInt((h.raw[5] || '').split(':')[0], 10);

                    if (!isNaN(endTime)) holdNotes.push({ startTime: h.time, endTime });

                    events.push({ time: h.time, isHold: true });
                } else if (h.typeField & 1) {
                    events.push({ time: h.time, isHold: false });
                }
            }

            events.sort((a, b) => a.time - b.time);
            const groups: any[] = [];

            for (const ev of events) {
                const last = groups[groups.length - 1];

                if (!last || ev.time - last.time > leniency) {
                    groups.push({ time: ev.time, hasNormal: !ev.isHold, hasHold: ev.isHold });
                } else {
                    if (ev.isHold) last.hasHold = true;
                    else last.hasNormal = true;
                }
            }

            let consecutive = 0;
            let runStart = 0;
            let lastGroupTime = -Infinity;
            let lastGroupType: string | null = null;

            for (const group of groups) {
                const groupType = group.hasNormal && group.hasHold ? 'mixed'
                    : group.hasHold ? 'hold'
                        : 'normal';

                const holdEndedHere = holdNotes.some(
                    h => h.startTime < runStart - leniency &&
                         h.endTime > lastGroupTime + leniency &&
                         h.endTime <= group.time + leniency
                );
                const breakHere = breaks.some(
                    b => b.startTime > lastGroupTime && b.startTime < group.time
                );

                if (groupType === 'mixed') {
                    if (consecutive > 3) {
                        violations.push({ timestamp: this.formatTimestamp(runStart), message: `${consecutive} consecutive ${lastGroupType} note groups` });
                    }

                    consecutive = 0;
                    lastGroupType = null;
                } else if (holdEndedHere || breakHere || groupType !== lastGroupType) {
                    if (consecutive > 3) {
                        violations.push({ timestamp: this.formatTimestamp(runStart), message: `${consecutive} consecutive ${lastGroupType} note groups` });
                    }

                    consecutive = 1;
                    runStart = group.time;
                    lastGroupType = groupType;
                } else {
                    consecutive++;
                }

                lastGroupTime = group.time;
            }

            if (consecutive > 3) {
                violations.push({ timestamp: this.formatTimestamp(runStart), message: `${consecutive} consecutive ${lastGroupType} note groups` });
            }
        },
        processFiles (files) {
            if (files.length === 0) return;

            const reader = new FileReader();

            reader.onload = (e) => {
                if (!e.target?.result) return;

                this.error = '';
                this.output = '';
                this.violations = [];

                const lines = (e.target.result as string).split('\r\n');
                const mode = this.parseMode(lines);

                if (mode === -1) {
                    this.error = 'Could not determine game mode.';

                    return;
                }

                const hitObjects = this.parseHitObjects(lines);
                const breaks = this.parseBreaks(lines);
                const violations: any[] = [];

                if (mode === 0) {
                    const sequence = hitObjects.map(h => {
                        if (h.typeField & 8) return { time: h.time, type: 'spinner' };
                        if (h.typeField & 2) return { time: h.time, type: 'slider' };

                        return { time: h.time, type: 'circle' };
                    });
                    this.checkConsecutive(sequence, breaks, violations);
                } else if (mode === 1) {
                    const sequence = hitObjects.map(h => {
                        if (h.typeField & 8) return { time: h.time, type: 'denden' };
                        if (h.typeField & 2) return { time: h.time, type: 'drumroll' };

                        const isKat = (h.hitsound & 2) !== 0 || (h.hitsound & 8) !== 0;

                        return { time: h.time, type: isKat ? 'kat' : 'don' };
                    });
                    this.checkConsecutive(sequence, breaks, violations);
                } else if (mode === 2) {
                    const sequence = hitObjects.map(h => {
                        if (h.typeField & 8) return { time: h.time, type: 'banana' };
                        if (h.typeField & 2) return { time: h.time, type: 'juice stream' };

                        return { time: h.time, type: 'fruit' };
                    });
                    this.checkConsecutive(sequence, breaks, violations, ['banana']);
                } else if (mode === 3) {
                    this.checkMania(hitObjects, breaks, violations);
                } else {
                    this.error = `Unknown game mode: ${mode}`;

                    return;
                }

                if (violations.length > 0) {
                    this.violations = violations;
                } else if (hitObjects.length === 0) {
                    this.error = 'No hit objects found.';
                } else {
                    this.output = 'No issues :)';
                }
            };

            reader.readAsText(files[0]);
        },
    },
});
</script>

