<template>
    <div class="col-sm-6">
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'MbcDropZone',
    emits: ['drop'],
    data () {
        return {
            isDragOver: false,
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
            this.$emit('drop', e.dataTransfer.files);
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
</style>
