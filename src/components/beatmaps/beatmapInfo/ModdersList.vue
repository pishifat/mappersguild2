<template>
    <div id="modders" class="row mb-2">
        <div class="col">
            <div>
                Modders ({{ beatmap.modders.length }})
                <small
                    v-if="canEdit"
                    class="ml-1"
                    data-toggle="tooltip"
                    data-placement="right"
                    title="add/remove yourself from modder list"
                >
                    <a
                        href="#"
                        :class="isModder ? 'text-danger' : 'text-success'"
                        @click.prevent="updateModder($event)"
                    >
                        <i class="fas" :class="isModder ? 'fa-minus' : 'fa-plus'" />
                    </a>
                </small>
            </div>
            <div class="small ml-3">
                <i v-if="beatmap.modders.length == 0" class="text-white-50">
                    none
                </i>
                <span v-else>
                    <template v-for="(modder, i) in beatmap.modders">
                        <a
                            :key="modder.id"
                            :href="'https://osu.ppy.sh/users/' + modder.osuId"
                            target="_blank"
                        >
                            {{ modder.username + (i < beatmap.modders.length - 1 ? ', ' : '') }}
                        </a>
                    </template>
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';

export default Vue.extend({
    name: 'ModdersList',
    props: {
        canEdit: Boolean,
        beatmap: {
            type: Object as () => Beatmap,
            required: true,
        },
    },
    computed: {
        ...mapState([
            'userOsuId',
        ]),
        isModder(): boolean {
            return this.beatmap.modders.some(m => m.osuId == this.userOsuId);
        },
    },
    methods: {
        async updateModder(e): Promise<void> {
            e.target.classList.add('fake-button-disable');
            const bm = await this.executePost(`/beatmaps/${this.beatmap.id}/updateModder`);

            if (!this.isError(bm)) {
                this.$store.dispatch('updateBeatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },
    },
});
</script>
