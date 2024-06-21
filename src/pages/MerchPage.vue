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
                <div class="mb-2">all products listed here have a 100% discount. prices are still listed on the checkout page for tax/customs reasons. depending on the product, they may be lower than store prices</div>
                <div>you can only begin the checkout process <b>once</b>! this requires...</div>
                <ul>
                    <li>contact email <span class="text-secondary small">(this must be the same as your osu! account's email)</span></li>
                    <li>shipping address</li>
                    <li>billing address <span class="text-secondary small">(can be the same as your shipping address)</span></li>
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
                <!-- world cup merch -->
                <div v-else-if="loggedInUser.worldCupMerch.active">
                    <div
                        class="card card-body my-2 ps-4"
                    >
                        <div>
                            based on your world cup placement(s), you'll receive these prizes:
                        </div>
                        <ul>
                            <li>{{ loggedInUser.worldCupMerch.sweater }} world cup sweater <span v-if="loggedInUser.worldCupMerch.additionalItems" class="text-secondary small">(for shipping reasons, we can only send one sweater)</span></li>
                            <li v-if="loggedInUser.worldCupMerch.additionalItems">{{ loggedInUser.worldCupMerch.additionalItems }} additional item(s) <span class="small text-secondary">(instead of the extra sweater above^)</span></li>
                            <li v-if="loggedInUser.worldCupMerch.pin">world cup pin</li>
                            <li>world cup sticker</li>
                            <span v-if="loggedInUser.worldCupMerch.coins.length">
                                <li v-for="coin in loggedInUser.worldCupMerch.coins" :key="coin">{{ coin }} challenge coin</li>
                            </span>
                        </ul>
                    choose a sweater size:
                    <select v-model="worldCupSweaterSize" class="form-select form-select-sm mb-2">
                        <option
                            disabled
                            value=""
                        >
                            Select a size
                        </option>
                        <option :disabled="loggedInUser.worldCupMerch.sweater == 2023 && loggedInUser.username != 'mrekk'" value="S">
                            Small
                        </option>
                        <option value="M">
                            Medium
                        </option>
                        <option value="L">
                            Large
                        </option>
                        <option value="XL">
                            XL
                        </option>
                        <option :disabled="loggedInUser.worldCupMerch.sweater == 2023" value="2XL">
                            2XL
                        </option>
                        <option :disabled="loggedInUser.worldCupMerch.sweater == 2023" value="3XL">
                            3xL
                        </option>
                    </select>
                    <button
                        class="btn btn-sm btn-outline-info mt-2 d-grid gap-2 col-12 mx-auto"
                        :disabled="!worldCupSweaterSize"
                        @click="checkout(null, $event)"
                    >
                        proceed to shopify checkout
                    </button>
                    </div>
                </div>
                <!-- general merch order -->
                <div v-else>
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
                                @click="checkout(variant.id, $event)"
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
            worldCupSweaterSize: '',
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
        async checkout(vid, e): Promise<void> {
            this.clicked = true;
            const checkout: any = await this.$http.executePost(`/merch/checkout`, { vid, size: this.worldCupSweaterSize }, e);

            console.log(checkout);

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