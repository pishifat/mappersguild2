<template>
    <div class="row justify-content-center my-2 py-3 page-content-header">
        <div class="col text-end pe-0">
            <img
                class="mx-3"
                :src="isLocus ? '/images/locus.png' : '/images/mg-logo-text.png'"
                width="100"
                height="100"
            />
        </div>
        <div class="col ps-0 my-auto">
            <h1>{{ title }}</h1>
            <div class="linear-divisor mb-1" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    computed: {
        title () {
            return this.$route.meta.title;
        },
        isLocus () {
            return this.$route.path == '/locus';
        },
    },
});
</script>