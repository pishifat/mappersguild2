<template>
    <div class="double-center">
        <section key="login">
            <div class="text-center">
                <a
                    href="/api/merchAuth"
                    class="btn btn-primary mb-2"
                    :class="clicked ? 'fake-button-disable' : ''"
                    @click="clicked = true"
                >
                    authorize your osu! account
                    <i class="fas fa-external-link-alt" />
                </a>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    data () {
        return {
            clicked: false,
        };
    },
});
</script>

<style scoped>
.double-center {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.fake-button-disable {
    pointer-events: none;
    opacity: 0.6;
}
</style>