<template>
    <div>
        <div>
            Potential Nominators ({{ selectedBeatmap.bns.length }})
            <small
                v-if="canEdit"
                class="ml-1"
                data-toggle="tooltip"
                data-placement="right"
                title="add/remove yourself from potential BN list"
            >
                <a
                    v-if="isBn"
                    href="#"
                    class="text-danger"
                    @click.prevent="updateBn($event)"
                >
                    <i class="fas fa-minus" />
                </a>
                <a
                    v-if="!isBn && selectedBeatmap.bns.length < 2"
                    href="#"
                    class="text-success"
                    @click.prevent="updateBn($event)"
                >
                    <i class="fas fa-plus" />
                </a>
            </small>
        </div>

        <div class="small ml-3">
            <i v-if="selectedBeatmap.bns.length == 0" class="text-white-50">none</i>

            <span v-else>
                <template v-for="(bn, i) in selectedBeatmap.bns">
                    <a
                        :key="bn.id"
                        :href="'https://osu.ppy.sh/users/' + bn.osuId"
                        target="_blank"
                    >
                        {{ bn.username + (i < selectedBeatmap.bns.length - 1 ? ', ' : '') }}
                    </a>
                </template>
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

export default Vue.extend({
    name: 'NominatorsList',
    props: {
        canEdit: Boolean,
    },
    computed: {
        ...mapState([
            'selectedBeatmap',
            'userOsuId',
        ]),
        isBn(): boolean {
            return this.selectedBeatmap.bns.some(bn => bn.osuId == this.userOsuId);
        },
    },
    methods: {
        async updateBn(e): Promise<void> {
            e.target.classList.add('fake-button-disable');
            const bm = await this.executePost('/beatmaps/updateBn/' + this.selectedBeatmap._id);

            if (this.isError(bm)) {
                this.$emit('update:info', bm.error);
            } else {
                this.$store.dispatch('updateBeatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },
    },
});
</script>
