<template>
    <div>
        <h4>
            <a v-if="url" :href="url" target="_blank">{{ name }}</a>
            <span v-else>{{ name }}</span>
        </h4>
        <div class="form-inline">
            <div class="form-group">
                hosted by

                <user-link-list
                    v-if="!showCreatorInput"
                    :users="creators"
                />

                <input
                    v-if="showCreatorInput"
                    v-model="creatorInput"
                    class="ml-1 form-control w-50 d-inline form-control-sm"
                    @change="updateCreators($event)"
                />
                <a
                    v-if="creatorIds.includes(loggedInUser.id)"
                    href="#"
                    class="ms-1"
                    @click.prevent="showCreatorInput = !showCreatorInput"
                >
                    <i class="fas fa-edit" />
                </a>
            </div>
        </div>
        <hr />
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { mapState } from 'vuex';
import { User } from '@interfaces/user';
import UserLinkList from '@components/UserLinkList.vue';

export default defineComponent({
    name: 'ContestHeader',
    components: {
        UserLinkList,
    },
    props: {
        contestId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            default: null,
        },
        creators: {
            type: Array as PropType<User[]>,
            required: true,
        },
    },
    data () {
        return {
            showCreatorInput: false,
            creatorInput: '',
        };
    },
    computed: {
        ...mapState(['loggedInUser']),
        creatorIds (): string[] {
            return this.creators.map(c => c.id);
        },
    },
    watch: {
        creators (): void {
            this.generateUsernamesString();
        },
    },
    created () {
        this.generateUsernamesString();
    },
    methods: {
        generateUsernamesString(): void {
            const usernames = this.creators.map(c => c.username);

            const usernameOutput = usernames.join(', ');

            this.creatorInput = usernameOutput;
        },
        async updateCreators(e): Promise<void> {
            const creators = await this.$http.executePost(`/contests/listing/${this.contestId}/updateCreators`, { creatorInput: this.creatorInput }, e);

            if (!this.$http.isError(creators)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Updated contest creators`,
                    type: 'info',
                });
                this.$store.commit('updateCreators', {
                    contestId: this.contestId,
                    creators,
                });
                this.showCreatorInput = false;
            }
        },
    },
});
</script>