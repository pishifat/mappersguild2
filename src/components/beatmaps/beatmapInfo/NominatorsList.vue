<template>
    <div>
        <div>
            Potential Nominators ({{ beatmap.bns.length }})
            <small
                class="ml-1"
                data-toggle="tooltip"
                data-placement="right"
                title="add/remove yourself from potential BN list"
                v-if="canEdit"
            >
                <a
                    href="#"
                    v-if="isBn"
                    class="text-danger"
                    @click.prevent="updateBn($event)"
                >
                    <i class="fas fa-minus"></i>
                </a>
                <a
                    href="#"
                    v-if="!isBn && beatmap.bns.length < 2"
                    class="text-success"
                    @click.prevent="updateBn($event)"
                >
                    <i class="fas fa-plus"></i>
                </a>
            </small>
        </div>
        <div class="small ml-3">
            <i v-if="beatmap.bns.length == 0" class="text-white-50">none</i>
            <span v-else>
                <template v-for="(bn, i) in beatmap.bns">
                    <a
                        :href="'https://osu.ppy.sh/users/' + bn.osuId"
                        target="_blank"
                        :key="bn.id"
                    >
                        {{ bn.username + (i < beatmap.bns.length - 1 ? ', ' : '') }}
                    </a>
                </template>
            </span>
        </div>
    </div>
</template>

<script>
import mixin from '../../../mixins.js';

export default {
    name: 'nominators-list',
    mixins: [ mixin ],
    props: {
        beatmap: Object,
        canEdit: Boolean,
        userOsuId: Number,
    },
    computed: {
        isBn() {
            return this.beatmap.bns.some(bn => bn.osuId == this.userOsuId);
        },
    },
    methods: {
        updateBn: async function(e) {
            e.target.classList.add('fake-button-disable');
            const bm = await this.executePost('/beatmaps/updateBn/' + this.beatmap._id);

            if (!bm || bm.error) {
                this.$emit('update:info', bm.error);
            } else {
                this.$emit('update:beatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },
    },
}
</script>
