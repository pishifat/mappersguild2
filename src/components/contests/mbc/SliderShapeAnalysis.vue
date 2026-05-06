<template>
    <div>
        <h5>Slider Shape Counter</h5>
        <h6>Count types of slidershapes</h6>
        <div class="row">
            <mbc-drop-zone @drop="processFiles" />

            <div v-if="output.length || error.length" class="col-sm-12 mt-2">
                <pre v-if="output.length" class="text-success">{{ output }}</pre>
                <pre v-if="error.length" class="text-danger">{{ error }}</pre>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MbcDropZone from '@components/contests/mbc/MbcDropZone.vue';

function analyzeSliderShapes(osuText) {
    const lines = osuText.trim().split('\n');

    for (const line of lines) {
        if (line.startsWith('Mode:')) {
            const mode = parseInt(line.split(':')[1], 10);

            if (mode === 1 || mode === 2 || mode === 3) return null;

            break;
        }
    }

    const shapeCounts = {};

    for (const line of lines) {
        const shape = getSliderShape(line);

        if (shape) shapeCounts[shape] = (shapeCounts[shape] ?? 0) + 1;
    }

    return shapeCounts;
}

function getSliderShape(line) {
    const parts = line.split(',');

    if (parts.length < 6) return null;

    if (!(parseInt(parts[3], 10) & 2)) return null;

    const startX = parseInt(parts[0], 10);
    const startY = parseInt(parts[1], 10);
    const curveField = parts[5].split('|');
    const curveType = curveField[0];
    const curveData = curveField.slice(1).join('|');

    // perfect curve
    if (curveType === 'P') return 'perfect curve';

    // linear
    if (curveType === 'L') return analyzeLinearShape(curveData, startX, startY);

    // bezier (but bezier ends up including everything so this is complicated)
    if (curveType === 'B') return analyzeCurveShape(curveData, startX, startY, false);

    // catmull (same)
    if (curveType === 'C') return analyzeCurveShape(curveData, startX, startY, true);

    return null;
}

function analyzeLinearShape(curveData, startX, startY) {
    let parts = curveData.split('|');

    if (parts.length && parts[0] === `${startX}:${startY}`) parts = parts.slice(1);

    const points = [[startX, startY]];

    for (const s of parts) {
        const p = parsePoint(s);

        if (p) points.push(p);
    }

    const numSegments = points.length - 1;

    if (numSegments <= 1) return 'straight';

    if (numSegments === 2) return '2 straight segments';

    if (numSegments === 3) return countDirectionChanges(points) >= 1 ? 'straight wave' : '3 straight segments';

    return 'straight complex shape';
}

function parsePoint(s) {
    const parts = s.split(':');

    if (parts.length < 2) return null;

    const x = parseInt(parts[0], 10);
    const y = parseInt(parts[1], 10);

    if (isNaN(x) || isNaN(y)) return null;

    return [x, y];
}

function countDirectionChanges(points) {
    if (points.length < 3) return 0;

    let changes = 0;
    let prevDir: any = null;

    for (let i = 0; i < points.length - 2; i++) {
        const turn = calcTurnDirection(points[i], points[i + 1], points[i + 2]);

        if (Math.abs(turn) < 0.01) continue;

        const currDir = turn > 0 ? 1 : -1;

        if (prevDir !== null && currDir !== prevDir) changes++;

        prevDir = currDir;
    }

    return changes;
}

function calcTurnDirection(p1, p2, p3) {
    return (p2[0] - p1[0]) * (p3[1] - p2[1]) - (p2[1] - p1[1]) * (p3[0] - p2[0]);
}

function analyzeCurveShape(curveData, startX, startY, isCatmull) {
    let points = curveData.split('|');

    if (points.length && points[0] === `${startX}:${startY}`) points = points.slice(1);

    if (!points.length) return 'straight';

    while (points.length >= 2 && points[points.length - 1] === points[points.length - 2]) {
        points = points.slice(0, -1);
    }

    if (!points.length) return 'straight';

    const segments: any[] = [];
    let current: any[] = [];
    let i = 0;

    while (i < points.length) {
        if (i + 1 < points.length && points[i] === points[i + 1]) {
            current.push(points[i]);

            if (current.length) segments.push(current);

            current = [];
            i += 2;
        } else {
            current.push(points[i]);
            i++;
        }
    }

    if (current.length) segments.push(current);

    let straightCount = 0, curveCount = 0;

    for (const seg of segments) {
        if (seg.length <= 1) straightCount++;
        else curveCount++;
    }

    const totalSegments = straightCount + curveCount;

    if (totalSegments > 3) {
        if (curveCount === 0) return 'straight complex shape';

        if (straightCount === 0) return isCatmull ? 'catmull complex shape' : 'bezier complex shape';

        return '4+ segment straight/curve shape';
    }

    if (curveCount === 1 && straightCount === 0) {
        const numAnchors = segments[0].length - 1;

        if (numAnchors <= 0) return 'straight';

        if (numAnchors === 1) return isCatmull ? '1 anchor catmull curve' : '1 anchor bezier curve';

        const parsed = [[startX, startY]];

        for (const s of segments[0]) {
            const p = parsePoint(s);

            if (p) parsed.push(p);
        }

        const changes = countDirectionChanges(parsed);

        if (numAnchors === 2) {
            if (changes === 0) return isCatmull ? '2 anchor catmull curve' : '2 anchor bezier curve';

            return isCatmull ? 'catmull wave' : 'bezier wave';
        }

        if (changes === 0) return isCatmull ? '3+ anchor catmull curve' : '3+ anchor bezier curve';

        if (changes === 1) return isCatmull ? 'catmull wave' : 'bezier wave';

        return isCatmull ? 'catmull complex shape' : 'bezier complex shape';
    }

    if (straightCount === 3 && curveCount === 0) {
        const parsed = [[startX, startY]];

        for (const seg of segments) {
            for (const s of seg) {
                const p = parsePoint(s);

                if (p) parsed.push(p);
            }
        }

        if (countDirectionChanges(parsed) >= 1) return 'straight wave';
    }

    if (curveCount === 2 && straightCount === 0) {
        if (isSmoothWave2Segments(segments, startX, startY)) {
            return isCatmull ? 'catmull wave' : 'bezier wave';
        }
    }

    return buildShapeDescription(straightCount, curveCount, isCatmull);
}

function isSmoothWave2Segments(segments, startX, startY) {
    if (segments.length !== 2) return false;

    const seg1 = segments[0], seg2 = segments[1];

    if (!seg1.length || !seg2.length) return false;

    const redAnchorStr = seg1[seg1.length - 1];
    const seg1Points = [[startX, startY]];

    for (const s of seg1) {
        const p = parsePoint(s);

        if (!p) return false;

        seg1Points.push(p);
    }

    const redAnchor = parsePoint(redAnchorStr);

    if (!redAnchor) return false;

    const seg2Points = [redAnchor];

    for (const s of seg2) {
        const p = parsePoint(s);

        if (!p) return false;

        seg2Points.push(p);
    }

    if (seg1Points.length < 2 || seg2Points.length < 2) return false;

    const angle = calcAngleAtPoint(seg1Points[seg1Points.length - 2], seg1Points[seg1Points.length - 1], seg2Points[1]);

    if (angle === null || angle > 1.0) return false;

    const dir1 = getSegmentDominantDirection(seg1Points);
    const dir2 = getSegmentDominantDirection(seg2Points);

    if (dir1 === 0 || dir2 === 0) return false;

    return dir1 * dir2 < 0;
}

function calcAngleAtPoint(p1, p2, p3) {
    const v1x = p2[0] - p1[0], v1y = p2[1] - p1[1];
    const v2x = p3[0] - p2[0], v2y = p3[1] - p2[1];
    const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

    if (mag1 < 0.0001 || mag2 < 0.0001) return null;

    const cos = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (mag1 * mag2)));

    return (Math.acos(cos) * 180) / Math.PI;
}

function getSegmentDominantDirection(points) {
    if (points.length < 3) return 0;

    let total = 0;

    for (let i = 0; i < points.length - 2; i++) {
        total += calcTurnDirection(points[i], points[i + 1], points[i + 2]);
    }

    if (Math.abs(total) < 0.01) return 0;

    return total > 0 ? 1 : -1;
}

function buildShapeDescription(straightCount, curveCount, isCatmull) {
    const curveLabel = isCatmull ? 'catmull curve' : 'bezier curve';

    if (curveCount === 0) {
        if (straightCount === 1) return 'straight';

        if (straightCount === 2) return '2 straight segments';

        return '3 straight segments';
    }

    if (straightCount === 0) {
        if (curveCount === 1) return isCatmull ? '1 anchor catmull curve' : '1 anchor bezier curve';

        if (curveCount === 2) return isCatmull ? '2 catmull curve segments' : '2 bezier curve segments';

        return isCatmull ? 'catmull complex shape' : 'bezier complex shape';
    }

    const parts: any[] = [];

    if (straightCount > 0) parts.push(`${straightCount} straight ${straightCount === 1 ? 'segment' : 'segments'}`);

    if (curveCount > 0) parts.push(`${curveCount} ${curveLabel} ${curveCount === 1 ? 'segment' : 'segments'}`);

    return parts.join(', ');
}

export default defineComponent({
    name: 'SliderShapeAnalysis',
    components: { MbcDropZone },
    data() {
        return {
            error: '',
            output: '',
        };
    },
    methods: {
        processFiles (files) {
            if (!files.length) return;

            const reader = new FileReader();

            reader.onload = (e) => {
                if (!e.target?.result) return;

                this.error = '';
                this.output = '';

                const shapeCounts = analyzeSliderShapes(e.target.result as string);

                if (shapeCounts === null) {
                    this.error = 'Invalid mode.';

                    return;
                }

                const total = Object.values(shapeCounts).reduce((a: any, b: any) => a + b, 0);

                if (total === 0) {
                    this.error = 'No sliders found.';

                    return;
                }

                const sorted = Object.entries(shapeCounts).sort((a: any, b: any) => b[1] - a[1]);

                this.output = sorted.map(([shape, count]) => `${shape}: ${count}`).join('\n');
            };

            reader.readAsText(files[0]);
        },
    },
});
</script>
