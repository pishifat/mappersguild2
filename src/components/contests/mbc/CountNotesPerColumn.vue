<template>
    <div>
        <h5>Monthly Beatmapping Contest: February 2024 (osu!mania)</h5>
        <h6>Count notes per column</h6>
        <div class="row">
            <mbc-drop-zone @drop="processFiles" />

            <div v-if="output?.length || error?.length" class="col-sm-12 d-flex align-items-center">
                <pre v-if="output?.length" class="text-success">{{ output }}</pre>
                <pre v-if="error?.length" class="text-danger">{{ error }}</pre>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MbcDropZone from '@components/contests/mbc/MbcDropZone.vue';

export default defineComponent({
    name: 'CountNotesPerColumn',
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
                        let keys;
                        let hitObjectsTrigger = false;
                        this.error = '';
                        this.output = '';
                        let c1 = 0;
                        let c2 = 0;
                        let c3 = 0;
                        let c4 = 0;
                        let c5 = 0;
                        let c6 = 0;
                        let c7 = 0;

                        for (const line of lines) {
                            if (line.includes('Mode:')) {
                                if (!line.includes('3')) {
                                    this.error = 'Mode is invalid for this contest!';

                                    return;
                                }
                            }

                            if (line.includes('CircleSize:')) {
                                if (line.includes('4')) {
                                    keys = 4;
                                } else if (line.includes('7')) {
                                    keys = 7;
                                } else {
                                    this.error = 'Key count is invalid for this contest!';

                                    return;
                                }
                            }

                            if (line.includes('[HitObjects]')) {
                                hitObjectsTrigger = true;
                            }

                            if (keys && hitObjectsTrigger) {
                                const hitObject = line.split(',');

                                if (keys == 4) {
                                    switch (hitObject[0]) {
                                        case '64':
                                            c1++;
                                            break;
                                        case '192':
                                            c2++;
                                            break;
                                        case '320':
                                            c3++;
                                            break;
                                        case '448':
                                            c4++;
                                            break;
                                        default:
                                            break;
                                    }
                                } else if (keys == 7) {
                                    switch (hitObject[0]) {
                                        case '36':
                                            c1++;
                                            break;
                                        case '109':
                                            c2++;
                                            break;
                                        case '182':
                                            c3++;
                                            break;
                                        case '256':
                                            c4++;
                                            break;
                                        case '329':
                                            c5++;
                                            break;
                                        case '402':
                                            c6++;
                                            break;
                                        case '475':
                                            c7++;
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }
                        }

                        const columns = [c1, c2, c3, c4, c5, c6, c7];

                        for (let i = 0; i < keys; i++) {
                            this.output += `Column ${i+1}: ${columns[i]} notes\n`;
                        }
                    }
                };

                reader.readAsText(file);
            }
        },
    },
});
</script>
