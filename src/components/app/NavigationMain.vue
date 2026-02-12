<template>
    <div>
        <nav id="top" class="navbar navbar-expand-md navbar-dark bg-dark">
            <div class="container-fluid">
                <router-link class="navbar-brand" to="/">
                    <img src="/images/mg-icon.png" alt="" />
                </router-link>

                <button
                    class="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbar"
                >
                    <span class="navbar-toggler-icon" />
                </button>

                <div id="navbar" class="collapse navbar-collapse">
                    <navigation-logged-in v-if="loggedInUser" />
                    <navigation-logged-out v-else-if="initialized" />
                </div>
            </div>
        </nav>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import NavigationLoggedIn from '@components/app/NavigationLoggedIn.vue';
import NavigationLoggedOut from '@components/app/NavigationLoggedOut.vue';

export default defineComponent({
    components: {
        NavigationLoggedIn,
        NavigationLoggedOut,
    },
    computed: {
        ...mapState([
            'loggedInUser',
            'initialized',
        ]),
    },
});
</script>