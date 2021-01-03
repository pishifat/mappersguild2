<template>
    <div>
        <div>
            Potential Nominators ({{ beatmap.bns.length }})
            <small
                v-if="canEdit"
                class="ms-1"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
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
                    v-if="!isBn && beatmap.bns.length < 2"
                    href="#"
                    class="text-success"
                    @click.prevent="updateBn($event)"
                >
                    <i class="fas fa-plus" />
                </a>
            </small>
        </div>

        <div class="small ms-3">
            <i v-if="beatmap.bns.length == 0" class="text-white-50">none</i>
            <user-link-list v-else :users="beatmap.bns" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';
import UserLinkList from '@components/UserLinkList.vue';

export default defineComponent({
    name: 'NominatorsList',
    components: { UserLinkList },
    props: {
        canEdit: Boolean,
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        isBn(): boolean {
            return this.beatmap.bns.some(bn => bn.osuId == this.loggedInUser.osuId);
        },
    },
    methods: {
        async updateBn(e): Promise<void> {
            e.target.classList.add('fake-button-disable');
            const bm = await this.$http.executePost<Beatmap>(`/beatmaps/${this.beatmap.id}/updateBn`);

            if (!this.$http.isError(bm)) {
                this.$store.dispatch('beatmaps/updateBeatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },
    },
});
</script>
