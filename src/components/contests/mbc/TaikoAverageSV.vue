<template>
    <div>
        <h4>Monthly Beatmapping Contest: July 2025 (osu!taiko)</h4>
        <h5>Confirm if the average SV of your map is between 0.95 and 1.05</h5>
        <div class="row">
            <div class="col-sm-12">
                <div
                    class="drop ms-4 my-4"
                    :class="isDragOver ? 'bg-dark' : ''"
                    @dragover.prevent="handleDragOver"
                    @dragenter.prevent="handleDragEnter"
                    @dragleave.prevent="handleDragLeave"
                    @drop.prevent="handleDrop"
                >
                    Drop a <code>.osu</code> file here
                </div>
            </div>

            <div v-if="output?.length || error?.length" class="col-sm-12 d-flex align-items-center">
                <pre v-if="output?.length" class="text-success">{{ output }}</pre>
                <pre v-if="error?.length" class="text-danger">{{ error }}</pre>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

type InheritedTimingPoint = {
    time: number;
    svMultiplier: number;
};

export default defineComponent({
    name: 'TaikoAverageSv',
    data() {
        return {
            isDragOver: false,
            error: '',
            output: '',
        };
    },
    methods: {
        handleDragOver () {
            this.isDragOver = true;
        },
        handleDragEnter () {
            this.isDragOver = true;
        },
        handleDragLeave () {
            this.isDragOver = false;
        },
        handleDrop (e) {
            this.isDragOver = false;
            const files = e.dataTransfer.files;
            this.processFiles(files);
        },
        extractMode(lines: string[]): number | null {
            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed.startsWith('Mode:')) {
                    const value = trimmed.split(':')[1]?.trim();
                    const mode = parseInt(value, 10);

                    return isNaN(mode) ? null : mode;
                }
            }

            return null;
        },
        extractSections(lines: string[]): { timingLines: string; hitObjectLines: string } {
            const timingLines: string[] = [];
            const hitObjectLines: string[] = [];

            let currentSection: 'timing' | 'hitobjects' | null = null;

            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed === '[TimingPoints]') {
                    currentSection = 'timing';
                    continue;
                } else if (trimmed === '[HitObjects]') {
                    currentSection = 'hitobjects';
                    continue;
                } else if (/^\[.+\]$/.test(trimmed)) { // check for section headers
                    currentSection = null;
                    continue;
                }

                if (currentSection === 'timing') {
                    if (trimmed !== '') timingLines.push(trimmed);
                } else if (currentSection === 'hitobjects') {
                    if (trimmed !== '') hitObjectLines.push(trimmed);
                }
            }

            return {
                timingLines: timingLines.join('\n'),
                hitObjectLines: hitObjectLines.join('\n'),
            };
        },
        extractSVMultipliers(timingPoints: string): InheritedTimingPoint[] {
            return timingPoints
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => {
                    const parts = line.split(',');
                    const time = parseInt(parts[0], 10);
                    const beatLength = parseFloat(parts[1]);
                    const uninherited = parseInt(parts[6], 10);

                    if (uninherited === 0) {
                        const svMultiplier = -100 / beatLength;

                        return { time, svMultiplier };
                    }

                    return null;
                })
                .filter(entry => entry !== null);
        },
        parseHitObjectTimes(hitObjectData: string): number[] {
            return hitObjectData
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => {
                    const parts = line.split(',');

                    return parseInt(parts[2], 10); // hitobject time
                });
        },
        filterUnusedInheritedTimingPoints(
            inheritedPoints: InheritedTimingPoint[],
            hitObjectTimes: number[]
        ): InheritedTimingPoint[] {
            inheritedPoints.sort((a, b) => a.time - b.time);
            hitObjectTimes.sort((a, b) => a - b);

            const usedTimes = new Set<number>();

            for (const hoTime of hitObjectTimes) {
                let applicable: InheritedTimingPoint | null = null;

                for (const point of inheritedPoints) {
                    if (point.time <= hoTime) {
                        applicable = point;
                    } else {
                        break;
                    }
                }

                if (applicable) {
                    usedTimes.add(applicable.time);
                }
            }

            return inheritedPoints.filter(point => usedTimes.has(point.time));
        },
        processFiles (files): void {
            if (files.length > 0) {
                const file = files[0];
                const reader = new FileReader();

                reader.onload = (e) => {
                    if (e.target && e.target.result) {
                        this.error = '';
                        this.output = '';

                        const fileContent = e.target.result as string;
                        const lines = fileContent.split('\r\n');

                        const mode = this.extractMode(lines);

                        if (mode !== 1) {
                            this.error = 'Not an osu!taiko beatmap!';

                            return;
                        }

                        const { timingLines, hitObjectLines } = this.extractSections(lines);
                        const svMultipliers = this.extractSVMultipliers(timingLines);
                        const hitObjectTimes = this.parseHitObjectTimes(hitObjectLines);
                        const usedSvMultipliers = this.filterUnusedInheritedTimingPoints(svMultipliers, hitObjectTimes);
                        const averageSv = Math.round(
                            usedSvMultipliers.reduce((sum, p) => sum + p.svMultiplier, 0) /
                            (usedSvMultipliers.length || 1) * 100
                        ) / 100;

                        // console.log(svMultipliers);
                        // console.log(hitObjectTimes);
                        // console.log(usedSvMultipliers);
                        // console.log(averageSv);

                        if (averageSv < 0.95 || averageSv > 1.05) {
                            this.error = `Average SV: ${averageSv.toFixed(2)} (not eligible)`;
                        } else {
                            this.output = `Average SV: ${averageSv.toFixed(2)} (eligible)`;
                        }

                        // console.log(this.error);
                        // console.log(this.output);
                    }
                };

                reader.readAsText(file);
            }
        },
    },
});
</script>

<style scoped>
.drop {
    border: 2px dashed #0087F7;
    border-radius: 5px;
    height: 200px;
    text-align: center;
    line-height: 200px;
}

.highlight {
  background-color: #f0f8ff5d;
}
</style>