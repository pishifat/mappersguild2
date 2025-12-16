<template>
    <div>
        <p class="opacity-0">
            .
        </p>
        <div v-if="!clicked" class="my-4">
            <div v-if="loggedInUser.hasMerchAccess" class="col-sm-12 card card-body ps-4">
                <h5 class="mt-2">
                    info
                </h5>
                <div>you can only begin the checkout process <b>once</b>! this requires...</div>
                <ul>
                    <li>contact email <span class="text-secondary small">(this must be the same as your osu! account's email)</span></li>
                    <li>shipping address</li>
                </ul>
                <div>when you've gathered this info, checkout below :)</div>
            </div>
            <div v-else class="double-center text-center">
                <p>request expired</p>
                <p>if you think something went wrong, <a href="https://osu.ppy.sh/community/chat?sendto=3178418" target="_blank">talk to pishifat</a></p>
            </div>

            <div v-if="loggedInUser.hasMerchAccess">
                <hr />
                <!-- specific merch order -->
                <div v-if="loggedInUser.hasSpecificMerchOrder">
                    <button
                        class="btn btn-sm btn-outline-info mt-2 d-grid gap-2 col-12 mx-auto"
                        @click="checkout(null, $event)"
                    >
                        your order has already been selected! proceed to checkout
                    </button>
                </div>
                <!-- general merch order -->
                <div v-else>
                    <div
                        v-for="merch in allMerch"
                        :key="merch.id"
                        class="card card-level-2 card-body my-2 ps-4"
                    >
                        <h4 class="text-lowercase">
                            {{ merch.title }}
                        </h4>
                        <button
                            class="btn btn-sm btn-outline-info mt-2 d-grid gap-2 col-12 mx-auto"
                            @click="checkout(merch.id, $event)"
                        >
                            proceed to shopify checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="double-center">
            redirecting to shopify checkout...
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import merchModule from '@store/merch';
import { Merch } from '@interfaces/merch';

export default defineComponent({
    name: 'MerchPage',
    data () {
        return {
            clicked: false,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapGetters('merch', [
            'allMerch',
        ]),
    },
    beforeCreate () {
        if (!this.$store.hasModule('merch')) {
            this.$store.registerModule('merch', merchModule);
        }
    },
    async created () {
        const res = await this.$http.initialRequest<{ merch: Merch }>('/merch/query');

        if (!this.$http.isError(res)) {
            this.$store.commit('merch/setMerch', res.merch);
        }
    },
    methods: {
        async checkout(pid, e): Promise<void> {
            console.log('aa');
            this.clicked = true;
            const checkoutUrl: any = await this.$http.executePost(`/merch/checkout`, { pid }, e);

            if (!this.$http.isError(checkoutUrl)) {
                window.location.replace(checkoutUrl);
            }
        },
    },
});
</script>

<style scoped>
.merch-img {
    position: relative;
    max-width: 128px;
    max-height: 128px;
    border-radius: 10%;
    box-shadow: 0 1px 1rem rgb(10, 10, 25);
    background-color: rgb(10, 10, 25);
}

.card-body {
    padding: 0.5rem 1rem 0.5rem 3.5rem;
}

.card-header {
    padding: 0.5rem 1rem 0.5rem 3.5rem;
}

.double-center {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>