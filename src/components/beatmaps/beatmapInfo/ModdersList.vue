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
                        :class="isModder ? 'text-danger' : 'text-success'"
                        @click.prevent="updateModder($event)"
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
        userOsuId: Number,
    },
    computed: {
        isModder() {
            return this.beatmap.modders.some(m => m.osuId == this.userOsuId);
        },
    },
    methods: {
        async updateModder(e) {
            e.target.classList.add('fake-button-disable');
            const bm = await this.executePost('/beatmaps/updateModder/' + this.beatmap._id);
            console.log(bm);
            
            if (!bm || bm.error) {
                this.$emit('update:info', (bm && bm.error) || 'Something went wrong!');
            } else {
                this.$emit('update:beatmap', bm);
            }

            e.target.classList.remove('fake-button-disable');
        },
    },
}
</script>
