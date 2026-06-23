<template>
    <div class="row flex-nowrap justify-content-center my-2 py-3 page-content-header">
        <div class="col text-end pe-0">
            <img
                class="mx-3"
                :src="isLocus ? '/images/nexus.png' : '/images/mg-logo-text.png'"
                width="100"
                height="100"
            />
        </div>
        <div class="col ps-0 my-auto">
            <img v-if="isAspire" src="/images/aspire_text.png" style="max-height: 2rem; max-width: 100%; width: auto; margin-top: 0.5rem; margin-bottom: 1rem;" />
            <h1 v-else>{{ title }}</h1>
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
        isAspire () {
            return this.$route.path.startsWith('/aspire');
        },
    },
});
</script>