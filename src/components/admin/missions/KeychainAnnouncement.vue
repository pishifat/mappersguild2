<template>
    <div>
        <div class="ms-2 mb-2">
            <textarea
                v-model="keychainText"
                length="4"
                class="ml-1 form-control"
                maxlength="40000"
                rows="6"
            />
            <button class="btn btn-sm w-100 btn-primary mt-2" @click="sendAnnouncement($event)">
                Send announcement
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Mission } from '@interfaces/mission';

export default defineComponent({
    name: 'ContestAnnouncements',
    props: {
        mission: {
            type: Object as () => Mission,
            required: true,
        },
    },
    data () {
        return {
            keychainText: ``,
        };
    },
    watch: {
        mission(): void {
            this.setKeychainText();
        },
    },
    created () {
        this.setKeychainText();
    },
    methods: {
        setKeychainText(): void {
            this.keychainText = `hello! you're receiving this message because you recently completed [**${this.mission.name}**](https://mappersguild.com/missions?id=${this.mission.id}) (a [mappers' guild priority quest](https://mappersguild.com/missions))\n\nif you want the keychain prize associated with your map, fill out this form: https://docs.google.com/forms/d/e/1FAIpQLSeSiYhbRY2uJLBGuzwSFL5NVuDKRK5eaOlpVNtM7HPtYfd_Tw/viewform?usp=sf_link\n\nthank you!!!`;
        },
        async sendAnnouncement(e): Promise<void> {
            const result = confirm(`Are you sure?`);

            if (result) {
                const announcement = await this.$http.executePost(`/admin/missions/${this.mission.id}/sendAnnouncement`, { text: this.keychainText }, e);

                if (!this.$http.isError(announcement)) {
                    this.$store.dispatch('updateToastMessages', {
                        message: `Announcement sent`,
                        type: 'info',
                    });
                }
            }
        },
    },
});
</script>