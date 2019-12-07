<template>
    <div>
        <div class="row mb-2">
            <div class="col">
                <div>
                    Link
                    <a
                        href="#"
                        id="editLink"
                        :class="editLinkInput ? 'text-danger' : ''"
                        class="text-success small ml-1"
                        @click.prevent="editLinkInput ? unsetLink() : setLink()"
                        data-toggle="tooltip"
                        data-placement="right"
                        title="edit link"
                    >
                        <i class="fas fa-edit"></i>
                    </a>
                </div>
                <div class="small ml-3">
                    <a v-if="beatmap.url" :href="beatmap.url" target="_blank">
                        {{ beatmap.url }}
                    </a>
                    <i v-else class="text-white-50">none</i>
                </div>
            </div>
        </div>
        <div class="row" id="linkInput" v-if="editLinkInput">
            <div class="col">
                <div class="input-group input-group-sm">
                    <input
                        class="form-control form-control-sm"
                        type="text"
                        placeholder="URL"
                        v-model="url"
                        @keyup.enter="saveLink($event)"
                    />
                    <div class="input-group-append">
                        <button
                            class="btn btn-outline-info"
                            type="submit"
                            id="addLinkButton"
                            @click="saveLink($event)"
                            data-toggle="tooltip"
                            data-placement="right"
                            title="use new osu!web link for card image"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from '../../../mixins.js';

export default {
    name: 'beatmap-link',
    mixins: [ mixin ],
    props: {
        beatmap: Object,
    },
    data () {
        return {
            url: null,
        }
    },
    methods: {
        setLink() {
            this.editLinkInput = true;
        },
        unsetLink() {
            this.editLinkInput = null;
        },
        saveLink: async function(e) {
            const bm = await this.executePost('/beatmaps/setLink/' + this.beatmap._id, { url: this.url }, e);

            if (bm) {
                this.editLinkInput = null;
                this.$emit('update:beatmap', bm);
            }
        },
    },
}
</script>
