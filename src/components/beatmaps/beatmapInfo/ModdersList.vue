<template>
    <div id="modders" class="row mb-2">
        <div class="col">
            <div>
                Modders ({{ beatmap.modders.length }})
                <small
                    v-if="canEdit"
                    class="ms-1"
                    data-bs-toggle="tooltip"
                    data-bs-placement="right"
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
            <div class="small ms-3">
                <i v-if="beatmap.modders.length == 0" class="text-white-50">
                    none
                </i>
                <span v-else>
                    <a
                        v-for="(modder, i) in beatmap.modders"
                        :key="modder.id"
                        :href="'https://osu.ppy.sh/users/' + modder.osuId"
                        target="_blank"
                    >
                        {{ listUser(modder.username, i, beatmap.modders.length) }}
                    </a>
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { Beatmap } from '../../../../interfaces/beatmap/beatmap';

export default defineComponent({
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
            'loggedInUser',
        ]),
        isModder(): boolean {
            return this.beatmap.modders.some(m => m.osuId == this.loggedInUser.osuId);
        },
    },
    methods: {
        async updateModder(e): Promise<void> {
            e.target.classList.add('fake-button-disable');
            const bm = await this.$http.executePost(`/beatmaps/${this.beatmap.id}/updateModder`);

            if (!this.$http.isError(bm)) {
                this.$store.dispatch('beatmaps/updateBeatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },
    },
});
</script>
