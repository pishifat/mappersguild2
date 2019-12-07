<template>
    <div id="modders" class="row mb-2">
        <div class="col">
            <div>
                Modders ({{ beatmap.modders.length }}) 
                <small
                    class="ml-1"
                    data-toggle="tooltip"
                    data-placement="right"
                    title="add/remove yourself from modder list"
                    v-if="canEdit"
                >
                    <a
                        href="#"
                        class="text-danger"
                        :class="[
                            fakeButton == beatmap.id + 'mod' ? 'fake-button-disable' : '',
                            isModder ? 'text-danger' : 'text-success'
                        ]"
                        @click.prevent="updateModder()"
                    >
                        <i class="fas" :class="isModder ? 'fa-minus' : 'fa-plus'"></i>
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
                            :href="'https://osu.ppy.sh/users/' + modder.osuId"
                            target="_blank"
                            :key="modder.id"
                        >
                                {{ modder.username + (i < beatmap.modders.length - 1 ? ', ' : '') }}
                        </a>
                    </template>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from '../../../mixins.js';

export default {
    name: 'modders-list',
    mixins: [ mixin ],
    props: {
        beatmap: Object,
        canEdit: Boolean,
    },
    methods: {
        updateModder: async function() {
            this.fakeButton = this.beatmap._id + 'mod';
            const bm = await this.executePost('/beatmaps/updateModder/' + this.beatmap._id);

            if (bm) {
                this.$emit('update:beatmap', bm);
            }

            this.fakeButton = null;
        },
    },
}
</script>
