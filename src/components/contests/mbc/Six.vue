<template>
    <div>
        <h4>Monthly Beatmapping Contest: February 2025 (osu!mania)</h4>
        <h5>Confirm if your map's object counts include and are divisible by 6</h5>
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

            <div v-if="output" class="col-sm-12 d-flex align-items-center">
                <code class="me-2"><pre>{{ output }}</pre></code>
                <code><pre class="text-danger">{{ error }}</pre></code>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'CountNotesPerColumn',
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