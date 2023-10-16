<template>
    <div id="navbar" class="collapse navbar-collapse">
        <navigation-always-visible />
        <form
            class="ms-auto me-3"
            action="/api/login"
            method="GET"
        >
            <button class="btn btn-sm btn-info" type="submit">
                Log in
            </button>
        </form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavigationAlwaysVisible from './NavigationAlwaysVisible.vue';

export default defineComponent({
    components: {
        NavigationAlwaysVisible,
    },
});
</script>