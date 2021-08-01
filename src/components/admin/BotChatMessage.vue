<template>
    <div>
        <div class="card card-body message-text small mb-2">
            <span v-for="(message, i) in messages" :key="i">
                {{ message }}
            </span>
        </div>

        <a v-if="users.length" class="btn btn-sm w-100 btn-success mb-2" @click="sendMessages($event)">
            Send messages
        </a>
    </div>
</template>

<script>

export default {
    name: 'BotChatMessage',
    props: {
        messages: {
            type: Array,
            default() {
                return [];
            },
            required: true,
        },
        messageType: {
            type: String,
            required: true,
        },
        mongoId: {
            type: String,
            required: true,
        },
        users: {
            type: Array,
            default() {
                return [];
            },
        },
        evalType: {
            type: String,
            default: '',
        },
    },
    methods: {
        async sendMessages (e) {
            const result = confirm(`Are you sure?`);

            if (result) {
                let route = '';

                switch (this.messageType) {
                    case 'contest':
                        route = 'contests';
                        break;
                    default:
                        return '';
                }

                await this.$http.executePost(`/admin/${route}/${this.mongoId}/sendMessages`, { users: this.users, messages: this.messages }, e);
            }
        },
    },
};
</script>

<style>
.message-text {
    background-color: darkslategray;
    margin: 0.75rem 0.75rem 0.75rem 0.75rem;
    padding: 0.75rem 0.75rem 0.75rem 0.75rem;
    box-shadow: 1px 1px 2px 1px black;
}
</style>
