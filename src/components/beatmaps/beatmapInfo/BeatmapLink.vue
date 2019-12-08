<template>
    <div>
        <div class="row mb-2">
            <div class="col">
                <div>
                    Link
                    <a
                        href="#"
                        id="editLink"
                        :class="showLinkInput ? 'text-danger' : ''"
                        class="text-success small ml-1"
                        @click.prevent="showLinkInput ? unsetLink() : setLink()"
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
        <div
            v-if="showLinkInput"
            class="row mb-2"
        >
            <div class="col-sm-12">
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
    watch: {
        beatmap() {
            if (this.beatmap) {
                this.showLinkInput = false;
                this.url = this.beatmap.url;
            }
        },
    },
    data () {
        return {
            url: null,
            showLinkInput: false,
        }
    },
    methods: {
        setLink() {
            this.showLinkInput = true;
        },
        unsetLink() {
            this.showLinkInput = false;
        },
        saveLink: async function(e) {
            const bm = await this.executePost('/beatmaps/setLink/' + this.beatmap._id, { url: this.url }, e);

            if (!bm || bm.error) {
                this.$emit('update:info', (bm && bm.error) || 'Something went wrong!');
            } else {
                this.showLinkInput = null;
                this.$emit('update:beatmap', bm);
            }
        },
    },
}
</script>
