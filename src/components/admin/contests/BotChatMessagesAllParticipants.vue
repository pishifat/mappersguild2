<template>
    <div>
        <a class="btn btn-sm w-100 btn-success mb-2" @click="sendAllMessages($event)">
            Send results messages to all participants
        </a>
    </div>
</template>

<script>

export default {
    name: 'BotChatMessagesAllParticipants',
    props: {
        mongoId: {
            type: String,
            required: true,
        },
    },
    methods: {
        async sendAllMessages (e) {
            const result = confirm(`Are you sure?`);

            if (result) {
                await this.$http.executePost(`/admin/contests/${this.mongoId}/sendAllMessages`, {}, e);
            }
        },
    },
};
</script>

<style>
</style>
