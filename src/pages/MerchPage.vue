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
                <p>all products listed here have a 100% discount, and the prices you see on shopify checkout are lower than the actual product values. (we'd mark them as free if we could!)</p>
                <p>to ensure nobody snags multiple free products, you can only begin the checkout process <b>once</b>! this requires...</p>
                <ul>
                    <li>contact email <span class="text-secondary small">(must match your osu! account's email address)</span></li>
                    <li>shipping address</li>
                    <li>billing address <span class="text-secondary small">(can be the same as your shipping address)</span></li>
                </ul>
                <p>when you've gathered this info, checkout any product below :)</p>
            </div>
            <div v-else class="double-center text-center">
                <p>request expired</p>
                <p>if you think something went wrong, <a href="https://osu.ppy.sh/community/chat?sendto=3178418" target="_blank">talk to pishifat</a>.</p>
            </div>
            <hr v-if="loggedInUser.hasMerchAccess" />
            <div>
                <div
                    v-for="merch in allMerch"
                    :key="merch.id"
                    class="card card-level-2 card-body my-2 ps-4"
                >
                    <h4 class="text-lowercase">{{ merch.title }}</h4>
                    <div class="d-inline">
                        <img
                            v-for="image in merch.images"
                            :key="image.id"
                            :src="image.src"
                            class="merch-img me-2 mb-2"
                        />
                    </div>

                    <div class="small text-secondary">
                        {{ merch.description }}
                    </div>
                    <div
                        v-for="variant in merch.variants"
                        :key="variant.id"
                    >
                        <button
                            class="btn btn-sm btn-outline-info mt-2 d-grid gap-2 col-12 mx-auto"
                            @click="checkout(merch.id, variant.id, $event)"
                        >
                            proceed to shopify checkout <span v-if="variant.title !== 'Default Title'">({{ variant.selectedOptions[0].name }}: {{ variant.selectedOptions[0].value }})</span>
                        </button>
                    </div>
                </div>
            </div>
            <p class="opacity-0">
                .
            </p>
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
            checkoutOutput: {},
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
        async checkout(gid, vid, e): Promise<void> {
            this.clicked = true;
            const checkout: any = await this.$http.executePost(`/merch/checkout`, { gid, vid }, e);

            if (!this.$http.isError(checkout)) {
                this.checkoutOutput = checkout;
                window.location.replace(checkout.webUrl);
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