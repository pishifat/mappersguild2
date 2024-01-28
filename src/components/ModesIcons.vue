<template>
    <template v-if="toggler">
        <a class="mode-margin" href="#" @click.prevent="$emit('toggle', 'osu')">
            <i
                v-bs-tooltip="'toggle osu!'"
                class="mode-icon"
                :style="`content: url(${osuIconContent});`"
            />
        </a>
        <a class="mode-margin" href="#" @click.prevent="$emit('toggle', 'taiko')">
            <i
                v-bs-tooltip="'toggle osu!taiko'"
                class="mode-icon"
                :style="`content: url(${taikoIconContent});`"
            />
        </a>
        <a class="mode-margin" href="#" @click.prevent="$emit('toggle', 'catch')">
            <i
                v-bs-tooltip="'toggle osu!catch'"
                class="mode-icon"
                :style="`content: url(${catchIconContent});`"
            />
        </a>
        <a class="mode-margin" href="#" @click.prevent="$emit('toggle', 'mania')">
            <i
                v-bs-tooltip="'toggle osu!mania'"
                class="mode-icon"
                :style="`content: url(${maniaIconContent});`"
            />
        </a>
    </template>
    <template v-else>
        <i
            v-if="modes.includes('osu')"
            v-bs-tooltip="'osu!'"
            class="mode-icon"
            :style="`content: url(${osuIconContent});`"
        />
        <i
            v-if="modes.includes('taiko')"
            v-bs-tooltip="'osu!taiko'"
            class="mode-icon"
            :style="`content: url(${taikoIconContent});`"
        />
        <i
            v-if="modes.includes('catch')"
            v-bs-tooltip="'osu!catch'"
            class="mode-icon"
            :style="`content: url(${catchIconContent});`"
        />
        <i
            v-if="modes.includes('mania')"
            v-bs-tooltip="'osu!mania'"
            class="mode-icon"
            :style="`content: url(${maniaIconContent});`"
        />
        <i
            v-if="modes.includes('hybrid')"
            v-bs-tooltip="'multiple game modes'"
            class="fas fa-check-double"
        />
    </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ModesIcons',
    props: {
        modes: {
            type: Array,
            required: true,
        },
        toggler: Boolean,
        color: {
            type: String,
            default: '',
        },
        overwriteColor: {
            type: String,
            default: '',
        },
    },
    emits: [
        'toggle',
    ],
    computed: {
        hexColor () {
            switch (this.color) {
                case 'secondary':
                    return 'DAC9C9';
                case 'dark':
                    return '292b2c';
                default:
                    return 'FFFFFF';
            }
        },
        overwriteHexColor () {
            switch (this.overwriteColor) {
                case 'secondary':
                    return 'DAC9C9';
                case 'dark':
                    return '292b2c';
                default:
                    return 'FFFFFF';
            }
        },
        osuIconContent () {
            if (this.toggler && this.modes.includes('osu')) {
                return `"data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 28.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='LOGO_LAYER' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 500 500' style='enable-background:new 0 0 500 500;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23${this.overwriteHexColor};%7D%0A%3C/style%3E%3Cg%3E%3Ccircle class='st0' cx='250' cy='250' r='130'/%3E%3Cpath class='st0' d='M250,140c29.4,0,57,11.4,77.8,32.2C348.6,193,360,220.6,360,250s-11.4,57-32.2,77.8 C307,348.6,279.4,360,250,360s-57-11.4-77.8-32.2C151.4,307,140,279.4,140,250s11.4-57,32.2-77.8C193,151.4,220.6,140,250,140 M250,100c-82.8,0-150,67.2-150,150s67.2,150,150,150s150-67.2,150-150S332.8,100,250,100L250,100z'/%3E%3C/g%3E%3Cg%3E%3Cpath class='st0' d='M250,55c107.7,0,195,87.3,195,195s-87.3,195-195,195c-107.7,0-195-87.3-195-195S142.3,55,250,55 M250,15 c-31.7,0-62.5,6.2-91.5,18.5c-28,11.8-53.1,28.8-74.7,50.3c-21.6,21.6-38.5,46.7-50.3,74.7C21.2,187.5,15,218.3,15,250 s6.2,62.5,18.5,91.5c11.8,28,28.8,53.1,50.3,74.7c21.6,21.6,46.7,38.5,74.7,50.3c29,12.3,59.8,18.5,91.5,18.5s62.5-6.2,91.5-18.5 c28-11.8,53.1-28.8,74.7-50.3c21.6-21.6,38.5-46.7,50.3-74.7c12.3-29,18.5-59.8,18.5-91.5s-6.2-62.5-18.5-91.5 c-11.8-28-28.8-53.1-50.3-74.7c-21.6-21.6-46.7-38.5-74.7-50.3C312.5,21.2,281.7,15,250,15L250,15z'/%3E%3C/g%3E%3C/svg%3E%0A"`;
            }

            return `"data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 28.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='LOGO_LAYER' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 500 500' style='enable-background:new 0 0 500 500;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23${this.hexColor};%7D%0A%3C/style%3E%3Cg%3E%3Ccircle class='st0' cx='250' cy='250' r='130'/%3E%3Cpath class='st0' d='M250,140c29.4,0,57,11.4,77.8,32.2C348.6,193,360,220.6,360,250s-11.4,57-32.2,77.8 C307,348.6,279.4,360,250,360s-57-11.4-77.8-32.2C151.4,307,140,279.4,140,250s11.4-57,32.2-77.8C193,151.4,220.6,140,250,140 M250,100c-82.8,0-150,67.2-150,150s67.2,150,150,150s150-67.2,150-150S332.8,100,250,100L250,100z'/%3E%3C/g%3E%3Cg%3E%3Cpath class='st0' d='M250,55c107.7,0,195,87.3,195,195s-87.3,195-195,195c-107.7,0-195-87.3-195-195S142.3,55,250,55 M250,15 c-31.7,0-62.5,6.2-91.5,18.5c-28,11.8-53.1,28.8-74.7,50.3c-21.6,21.6-38.5,46.7-50.3,74.7C21.2,187.5,15,218.3,15,250 s6.2,62.5,18.5,91.5c11.8,28,28.8,53.1,50.3,74.7c21.6,21.6,46.7,38.5,74.7,50.3c29,12.3,59.8,18.5,91.5,18.5s62.5-6.2,91.5-18.5 c28-11.8,53.1-28.8,74.7-50.3c21.6-21.6,38.5-46.7,50.3-74.7c12.3-29,18.5-59.8,18.5-91.5s-6.2-62.5-18.5-91.5 c-11.8-28-28.8-53.1-50.3-74.7c-21.6-21.6-46.7-38.5-74.7-50.3C312.5,21.2,281.7,15,250,15L250,15z'/%3E%3C/g%3E%3C/svg%3E%0A"`;
        },
        taikoIconContent () {
            if (this.toggler && this.modes.includes('taiko')) {
                return `"data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 28.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='LOGO_LAYER' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 500 500' style='enable-background:new 0 0 500 500;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:none;%7D .st1%7Bfill:%23${this.overwriteHexColor};%7D%0A%3C/style%3E%3Cg%3E%3Cpath class='st0' d='M225,153.2c-43.1,11.1-75,50.3-75,96.8c0,46.5,31.9,85.7,75,96.8V153.2z'/%3E%3Cpath class='st0' d='M275,153.2v193.7c43.1-11.1,75-50.3,75-96.8C350,203.5,318.1,164.3,275,153.2z'/%3E%3Cpath class='st1' d='M250,100c-82.8,0-150,67.2-150,150s67.2,150,150,150s150-67.2,150-150S332.8,100,250,100z M150,250 c0-46.5,31.9-85.7,75-96.8v193.7C181.9,335.7,150,296.5,150,250z M275,346.8V153.2c43.1,11.1,75,50.3,75,96.8 C350,296.5,318.1,335.7,275,346.8z'/%3E%3C/g%3E%3Cg%3E%3Cpath class='st1' d='M250,55c107.7,0,195,87.3,195,195s-87.3,195-195,195c-107.7,0-195-87.3-195-195S142.3,55,250,55 M250,15 c-31.7,0-62.5,6.2-91.5,18.5c-28,11.8-53.1,28.8-74.7,50.3c-21.6,21.6-38.5,46.7-50.3,74.7C21.2,187.5,15,218.3,15,250 s6.2,62.5,18.5,91.5c11.8,28,28.8,53.1,50.3,74.7c21.6,21.6,46.7,38.5,74.7,50.3c29,12.3,59.8,18.5,91.5,18.5s62.5-6.2,91.5-18.5 c28-11.8,53.1-28.8,74.7-50.3c21.6-21.6,38.5-46.7,50.3-74.7c12.3-29,18.5-59.8,18.5-91.5s-6.2-62.5-18.5-91.5 c-11.8-28-28.8-53.1-50.3-74.7c-21.6-21.6-46.7-38.5-74.7-50.3C312.5,21.2,281.7,15,250,15L250,15z'/%3E%3C/g%3E%3C/svg%3E%0A"`;
            }

            return `"data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 28.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='LOGO_LAYER' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 500 500' style='enable-background:new 0 0 500 500;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:none;%7D .st1%7Bfill:%23${this.hexColor};%7D%0A%3C/style%3E%3Cg%3E%3Cpath class='st0' d='M225,153.2c-43.1,11.1-75,50.3-75,96.8c0,46.5,31.9,85.7,75,96.8V153.2z'/%3E%3Cpath class='st0' d='M275,153.2v193.7c43.1-11.1,75-50.3,75-96.8C350,203.5,318.1,164.3,275,153.2z'/%3E%3Cpath class='st1' d='M250,100c-82.8,0-150,67.2-150,150s67.2,150,150,150s150-67.2,150-150S332.8,100,250,100z M150,250 c0-46.5,31.9-85.7,75-96.8v193.7C181.9,335.7,150,296.5,150,250z M275,346.8V153.2c43.1,11.1,75,50.3,75,96.8 C350,296.5,318.1,335.7,275,346.8z'/%3E%3C/g%3E%3Cg%3E%3Cpath class='st1' d='M250,55c107.7,0,195,87.3,195,195s-87.3,195-195,195c-107.7,0-195-87.3-195-195S142.3,55,250,55 M250,15 c-31.7,0-62.5,6.2-91.5,18.5c-28,11.8-53.1,28.8-74.7,50.3c-21.6,21.6-38.5,46.7-50.3,74.7C21.2,187.5,15,218.3,15,250 s6.2,62.5,18.5,91.5c11.8,28,28.8,53.1,50.3,74.7c21.6,21.6,46.7,38.5,74.7,50.3c29,12.3,59.8,18.5,91.5,18.5s62.5-6.2,91.5-18.5 c28-11.8,53.1-28.8,74.7-50.3c21.6-21.6,38.5-46.7,50.3-74.7c12.3-29,18.5-59.8,18.5-91.5s-6.2-62.5-18.5-91.5 c-11.8-28-28.8-53.1-50.3-74.7c-21.6-21.6-46.7-38.5-74.7-50.3C312.5,21.2,281.7,15,250,15L250,15z'/%3E%3C/g%3E%3C/svg%3E%0A"`;
        },
        catchIconContent () {
            if (this.toggler && this.modes.includes('catch')) {
                return `"data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 28.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='LOGO_LAYER' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 500 500' style='enable-background:new 0 0 500 500;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23${this.overwriteHexColor};%7D%0A%3C/style%3E%3Cg%3E%3Cpath class='st0' d='M250,55c107.7,0,195,87.3,195,195s-87.3,195-195,195c-107.7,0-195-87.3-195-195S142.3,55,250,55 M250,15 c-31.7,0-62.5,6.2-91.5,18.5c-28,11.8-53.1,28.8-74.7,50.3c-21.6,21.6-38.5,46.7-50.3,74.7C21.2,187.5,15,218.3,15,250 s6.2,62.5,18.5,91.5c11.8,28,28.8,53.1,50.3,74.7c21.6,21.6,46.7,38.5,74.7,50.3c29,12.3,59.8,18.5,91.5,18.5s62.5-6.2,91.5-18.5 c28-11.8,53.1-28.8,74.7-50.3c21.6-21.6,38.5-46.7,50.3-74.7c12.3-29,18.5-59.8,18.5-91.5s-6.2-62.5-18.5-91.5 c-11.8-28-28.8-53.1-50.3-74.7c-21.6-21.6-46.7-38.5-74.7-50.3C312.5,21.2,281.7,15,250,15L250,15z'/%3E%3C/g%3E%3Cg%3E%3Ccircle class='st0' cx='308.8' cy='250' r='37.5'/%3E%3Ccircle class='st0' cx='221.2' cy='173.8' r='37.5'/%3E%3Ccircle class='st0' cx='221.2' cy='326.2' r='37.5'/%3E%3C/g%3E%3C/svg%3E%0A"`;
            }

            return `"data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 28.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='LOGO_LAYER' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 500 500' style='enable-background:new 0 0 500 500;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23${this.hexColor};%7D%0A%3C/style%3E%3Cg%3E%3Cpath class='st0' d='M250,55c107.7,0,195,87.3,195,195s-87.3,195-195,195c-107.7,0-195-87.3-195-195S142.3,55,250,55 M250,15 c-31.7,0-62.5,6.2-91.5,18.5c-28,11.8-53.1,28.8-74.7,50.3c-21.6,21.6-38.5,46.7-50.3,74.7C21.2,187.5,15,218.3,15,250 s6.2,62.5,18.5,91.5c11.8,28,28.8,53.1,50.3,74.7c21.6,21.6,46.7,38.5,74.7,50.3c29,12.3,59.8,18.5,91.5,18.5s62.5-6.2,91.5-18.5 c28-11.8,53.1-28.8,74.7-50.3c21.6-21.6,38.5-46.7,50.3-74.7c12.3-29,18.5-59.8,18.5-91.5s-6.2-62.5-18.5-91.5 c-11.8-28-28.8-53.1-50.3-74.7c-21.6-21.6-46.7-38.5-74.7-50.3C312.5,21.2,281.7,15,250,15L250,15z'/%3E%3C/g%3E%3Cg%3E%3Ccircle class='st0' cx='308.8' cy='250' r='37.5'/%3E%3Ccircle class='st0' cx='221.2' cy='173.8' r='37.5'/%3E%3Ccircle class='st0' cx='221.2' cy='326.2' r='37.5'/%3E%3C/g%3E%3C/svg%3E%0A"`;
        },
        maniaIconContent () {
            if (this.toggler && this.modes.includes('mania')) {
                return `"data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 28.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='LOGO_LAYER' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 500 500' style='enable-background:new 0 0 500 500;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23${this.overwriteHexColor};%7D%0A%3C/style%3E%3Cg%3E%3Cpath class='st0' d='M250,401c-13.8,0-25-11.2-25-25V124c0-13.8,11.2-25,25-25c13.8,0,25,11.2,25,25v252 C275,389.8,263.8,401,250,401z'/%3E%3C/g%3E%3Cg%3E%3Cpath class='st0' d='M170,330c-13.8,0-25-11.2-25-25V195c0-13.8,11.2-25,25-25s25,11.2,25,25v110C195,318.8,183.8,330,170,330z'/%3E%3C/g%3E%3Cg%3E%3Cpath class='st0' d='M330,330c-13.8,0-25-11.2-25-25V195c0-13.8,11.2-25,25-25c13.8,0,25,11.2,25,25v110 C355,318.8,343.8,330,330,330z'/%3E%3C/g%3E%3Cg%3E%3Cpath class='st0' d='M250,55c107.7,0,195,87.3,195,195s-87.3,195-195,195c-107.7,0-195-87.3-195-195S142.3,55,250,55 M250,15 c-31.7,0-62.5,6.2-91.5,18.5c-28,11.8-53.1,28.8-74.7,50.3c-21.6,21.6-38.5,46.7-50.3,74.7C21.2,187.5,15,218.3,15,250 s6.2,62.5,18.5,91.5c11.8,28,28.8,53.1,50.3,74.7c21.6,21.6,46.7,38.5,74.7,50.3c29,12.3,59.8,18.5,91.5,18.5s62.5-6.2,91.5-18.5 c28-11.8,53.1-28.8,74.7-50.3c21.6-21.6,38.5-46.7,50.3-74.7c12.3-29,18.5-59.8,18.5-91.5s-6.2-62.5-18.5-91.5 c-11.8-28-28.8-53.1-50.3-74.7c-21.6-21.6-46.7-38.5-74.7-50.3C312.5,21.2,281.7,15,250,15L250,15z'/%3E%3C/g%3E%3C/svg%3E%0A"`;
            }

            return `"data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 28.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='LOGO_LAYER' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 500 500' style='enable-background:new 0 0 500 500;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23${this.hexColor};%7D%0A%3C/style%3E%3Cg%3E%3Cpath class='st0' d='M250,401c-13.8,0-25-11.2-25-25V124c0-13.8,11.2-25,25-25c13.8,0,25,11.2,25,25v252 C275,389.8,263.8,401,250,401z'/%3E%3C/g%3E%3Cg%3E%3Cpath class='st0' d='M170,330c-13.8,0-25-11.2-25-25V195c0-13.8,11.2-25,25-25s25,11.2,25,25v110C195,318.8,183.8,330,170,330z'/%3E%3C/g%3E%3Cg%3E%3Cpath class='st0' d='M330,330c-13.8,0-25-11.2-25-25V195c0-13.8,11.2-25,25-25c13.8,0,25,11.2,25,25v110 C355,318.8,343.8,330,330,330z'/%3E%3C/g%3E%3Cg%3E%3Cpath class='st0' d='M250,55c107.7,0,195,87.3,195,195s-87.3,195-195,195c-107.7,0-195-87.3-195-195S142.3,55,250,55 M250,15 c-31.7,0-62.5,6.2-91.5,18.5c-28,11.8-53.1,28.8-74.7,50.3c-21.6,21.6-38.5,46.7-50.3,74.7C21.2,187.5,15,218.3,15,250 s6.2,62.5,18.5,91.5c11.8,28,28.8,53.1,50.3,74.7c21.6,21.6,46.7,38.5,74.7,50.3c29,12.3,59.8,18.5,91.5,18.5s62.5-6.2,91.5-18.5 c28-11.8,53.1-28.8,74.7-50.3c21.6-21.6,38.5-46.7,50.3-74.7c12.3-29,18.5-59.8,18.5-91.5s-6.2-62.5-18.5-91.5 c-11.8-28-28.8-53.1-50.3-74.7c-21.6-21.6-46.7-38.5-74.7-50.3C312.5,21.2,281.7,15,250,15L250,15z'/%3E%3C/g%3E%3C/svg%3E%0A"`;
        },
    },
});
</script>

<style scoped>
.mode-icon {
    height: 1em;
    width: 1em;
    display: inline-flex;
    vertical-align: -0.15em;
}

</style>