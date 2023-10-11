<template>
    <div>
        okkkkk
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import merchModule from '@store/merch';
import { Merch } from '@interfaces/merch';

export default defineComponent({
    name: 'MerchPage',
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
    },
});
</script>
