<template>
    <div v-cloak id="app">
        <navigation-main v-if="!isMerchPage" />

        <!-- style ensures footer doesnt appear weirdly high up. fixed position looks even more awkward. don't worry about it -->
        <div class="container" style="min-height: 85vh">
            <page-header
                v-if="(initialized && (loggedInUser || isPublicPage)) && !isHome && !isMerchPage"
            />

            <loading-page>
                <authorize
                    v-if="initialized && !loggedInUser && !isPublicPage && !isMerchPage"
                />
                <authorize-merch
                    v-else-if="initialized && !loggedInUser && !isPublicPage && isMerchPage"
                />
                <template v-else-if="isPublicPage || loggedInUser">
                    <router-view v-slot="{ Component }">
                        <transition name="route-transition" mode="out-in">
                            <component :is="Component" />
                        </transition>
                    </router-view>
                </template>
            </loading-page>
        </div>

        <page-footer v-if="!isMerchPage" />

        <toast-messages />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import LoadingPage from '@components/LoadingPage.vue';
import ToastMessages from '@components/ToastMessages.vue';
import NavigationMain from '@components/app/NavigationMain.vue';
import PageFooter from '@components/app/PageFooter.vue';
import PageHeader from '@components/app/PageHeader.vue';
import Authorize from '@components/app/Authorize.vue';
import AuthorizeMerch from '@components/app/AuthorizeMerch.vue';

export default defineComponent({
    components: {
        LoadingPage,
        ToastMessages,
        NavigationMain,
        PageFooter,
        PageHeader,
        Authorize,
        AuthorizeMerch,
    },
    computed: {
        ...mapState([
            'loggedInUser',
            'initialized',
        ]),
        isPublicPage () {
            return this.$route.meta.isPublic;
        },
        isMerchPage () {
            return this.$route.path == '/merch';
        },
        isHome () {
            return this.$route.path == '/';
        },
    },
});
</script>