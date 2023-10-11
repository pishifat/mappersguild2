<template>
    <div>
        <div class="row">
            <div class="col-sm-6">
                <div
                    v-for="merch in allMerch"
                    :key="merch.id"
                    class="card card-level-2 card-body my-2"
                >
                    <img :src="merch.images[0].src" class="card-avatar-img" />

                    <div>{{ merch.title }}</div>
                    <div class="small text-secondary">{{ merch.description }}</div>
                    <div
                        v-for="variant in merch.variants"
                        :key="variant.id"
                    >
                        <button
                            class="btn btn-sm btn-outline-info mt-2"
                            @click="checkout(merch.id, variant.id, $event)"
                        >
                            checkout ({{ variant.selectedOptions[0].name }}: {{ variant.selectedOptions[0].value }})
                        </button>
                    </div>
                </div>
            </div>
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
            const checkout: any = await this.$http.executePost(`/merch/checkout`, { gid, vid }, e);

            if (!this.$http.isError(checkout)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `something happened`,
                    type: 'info',
                });
                this.checkoutOutput = checkout;
                window.location.replace(checkout.webUrl);
            }
        },
    },
});
</script>

<style scoped>
.card-avatar-img {
    position: absolute;
    top: calc(50% - 30px);
    left: -15px;
    max-width: 60px;
    max-height: 60px;
    object-fit: cover;
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
</style>