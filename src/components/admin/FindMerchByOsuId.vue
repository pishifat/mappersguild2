<template>
    <div class="container card card-body">
        <h5>
            Find merch by osu! order ID
        </h5>
        <div class="text-secondary small mb-1">
            Use ASS to find provider output (something like <code>.lookup-order 2222222</code>), then paste that below
        </div>
        <input
            v-model="userInput"
            class="form-control form-control-sm mb-2"
            type="text"
            autocomplete="off"
            placeholder="enter to search..."
            @keyup.enter="searchOrder($event)"
        />
        <button class="btn btn-sm w-100 btn-info mb-2" @click="searchOrder($event)">
            Load order ID
        </button>
        <div v-if="orderOutput">
            Order: <code v-if="orderOutput">{{ orderOutput }}</code>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'FindMerchByOsuId',
    data () {
        return {
            orderOutput: '',
            userInput: '',
        };
    },
    methods: {
        async searchOrder(e) {
            const orderOutput = await this.$http.executePost<string>(`/admin/merch/searchOrder`, { userInput: this.userInput }, e);

            if (!this.$http.isError(orderOutput)) {
                this.orderOutput = orderOutput;
                console.log(orderOutput);
            }
        },
    },
});
</script>
