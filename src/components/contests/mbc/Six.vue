<template>
    <div>
        <h5>Monthly Beatmapping Contest: February 2025 (osu!mania)</h5>
        <h6>Confirm if your map's object counts include and are divisible by 6</h6>
        <div class="row">
            <mbc-drop-zone @drop="processFiles" />

            <div v-if="output?.length || error?.length" class="col-sm-12">
                <pre v-if="output?.length" class="text-success">{{ output }}</pre>
                <pre v-if="error?.length" class="text-danger mt-2">{{ error }}</pre>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MbcDropZone from '@components/contests/mbc/MbcDropZone.vue';

export default defineComponent({
    name: 'Six',
    components: {
        MbcDropZone,
    },
    data() {
        return {
            error: '',
            output: '',
        };
    },
    methods: {
        processFiles (files): void {
            if (files.length > 0) {
                const file = files[0];
                const reader = new FileReader();

                reader.onload = (e) => {
                    if (e.target && e.target.result) {
                        const fileContent = e.target.result as string;
                        const lines = fileContent.split('\r\n');
                        let hitObjectsTrigger = false;
                        this.error = '';
                        this.output = '';
                        let singleNotes = 0;
                        let longNotes = 0;

                        for (const line of lines) {
                            if (line.includes('Mode:')) {
                                if (!line.includes('3')) {
                                    this.error = 'Mode is invalid for this contest!';

                                    return;
                                }
                            }

                            if (line.includes('[HitObjects]')) {
                                hitObjectsTrigger = true;
                            }

                            if (hitObjectsTrigger) {
                                if (line.includes(',128,')) {
                                    longNotes++;
                                } else if (line.includes(',1,') || line.includes(',5,')) {
                                    singleNotes++;
                                }
                            }
                        }

                        const totalNotes = singleNotes + longNotes;

                        this.output = `Single notes: ${singleNotes}\n`;

                        if (!singleNotes.toString().includes('6')) {
                            this.error += `Single notes count (${singleNotes}) does not include a 6!\n`;
                        }

                        if (singleNotes % 6) {
                            const mod = singleNotes % 6;
                            this.error += `Single notes count (${singleNotes}) is not divisible by 6! (Remove ${mod} note${mod == 1 ? '' : 's'} or add ${6 - mod} note${mod == 5 ? '' : 's'})\n`;
                        }


                        this.output += `Long notes: ${longNotes}\n`;

                        if (!longNotes.toString().includes('6')) {
                            this.error += `Long notes count (${longNotes}) does not include a 6!\n`;
                        }

                        if (longNotes % 6) {
                            const mod = longNotes % 6;
                            this.error += `Long note count (${longNotes}) is not divisible by 6! (Remove ${mod} note${mod == 1 ? '' : 's'} or add ${6 - mod} note${mod == 5 ? '' : 's'})\n`;
                        }

                        this.output += `Total notes: ${totalNotes}`;

                        if (!totalNotes.toString().includes('6')) {
                            this.error += `Total notes count (${totalNotes}) does not include a 6!\n`;
                        }

                        if (totalNotes % 6) {
                            const mod = totalNotes % 6;
                            this.error += `Total notes count (${totalNotes}) is not divisible by 6! (Remove ${mod} note${mod == 1 ? '' : 's'} or add ${6 - mod} note${mod == 5 ? '' : 's'})\n`;
                        }
                    }
                };

                reader.readAsText(file);
            }
        },
    },
});
</script>

